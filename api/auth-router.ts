import * as cookie from "cookie";
import { z } from "zod";
import { Session } from "../contracts/constants.js";
import { getSessionCookieOptions } from "./lib/cookies.js";
import { createRouter, authedQuery, adminQuery, publicQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import { users } from "../db/schema.js";
import {
  findUserByEmail,
  createLocalUser,
  updateUserLastSignIn,
} from "./queries/users.js";
import { signSessionToken } from "./kimi/session.js";
import { env } from "./lib/env.js";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

// Simple password hashing using Web Crypto API (no bcrypt dependency)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + env.appSecret);
  const hash = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hash));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const computed = await hashPassword(password);
  return computed === hash;
}

// Generate a local JWT token for non-OAuth users
async function createLocalSessionToken(userId: number, email: string): Promise<string> {
  return signSessionToken({
    unionId: `local_${userId}_${email}`,
    clientId: env.appId,
  });
}

export const authRouter = createRouter({
  me: authedQuery.query((opts) => opts.ctx.user),

  logout: authedQuery.mutation(async ({ ctx }) => {
    const opts = getSessionCookieOptions(ctx.req.headers);
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize(Session.cookieName, "", {
        httpOnly: opts.httpOnly,
        path: opts.path,
        sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
        secure: opts.secure,
        maxAge: 0,
      }),
    );
    return { success: true };
  }),

  listUsers: adminQuery.query(async () => {
    const db = getDb();
    return db.query.users.findMany({
      orderBy: (users, { desc }) => [desc(users.createdAt)],
    });
  }),

  // Local registration (email/password)
  register: publicQuery
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Invalid email"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        phone: z.string().optional().default(""),
        role: z.enum(["customer", "worker"]).default("customer"),
      }),
    )
    .mutation(async ({ input }) => {
      // Check if email already exists
      const existing = await findUserByEmail(input.email);
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email already registered. Please login instead.",
        });
      }

      const passwordHash = await hashPassword(input.password);
      const userId = await createLocalUser({
        name: input.name,
        email: input.email,
        passwordHash,
        phone: input.phone ?? "",
        role: input.role,
      });

      if (!userId) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create user.",
        });
      }

      // Generate session token
      const token = await createLocalSessionToken(userId, input.email);

      return {
        success: true,
        token,
        user: {
          id: userId,
          name: input.name,
          email: input.email,
          role: input.role,
        },
      };
    }),

  // Local login (email/password)
  login: publicQuery
    .input(
      z.object({
        email: z.string().email("Invalid email"),
        password: z.string().min(1, "Password is required"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = await findUserByEmail(input.email);
      if (!user || !user.passwordHash) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password.",
        });
      }

      const valid = await verifyPassword(input.password, user.passwordHash);
      if (!valid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password.",
        });
      }

      // Update last sign in
      await updateUserLastSignIn(user.id);

      // Generate session token
      const token = await createLocalSessionToken(user.id, user.email ?? "");

      // Set cookie
      const cookieOpts = getSessionCookieOptions(ctx.req.headers);
      ctx.resHeaders.append(
        "set-cookie",
        cookie.serialize(Session.cookieName, token, {
          httpOnly: cookieOpts.httpOnly,
          path: cookieOpts.path,
          sameSite: cookieOpts.sameSite?.toLowerCase() as "lax" | "none",
          secure: cookieOpts.secure,
          maxAge: Session.maxAgeMs / 1000,
        }),
      );

      return {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar,
        },
      };
    }),

  // Get local auth token after registration (to set cookie manually)
  getLocalToken: publicQuery
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const user = await findUserByEmail(input.email);
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }
      const token = await createLocalSessionToken(user.id, user.email ?? "");
      return { token };
    }),
});
