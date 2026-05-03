import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { User } from "../db/schema.js";
import { authenticateRequest } from "./kimi/auth.js";
import { findUserByEmail } from "./queries/users.js";
import { verifySessionToken } from "./kimi/session.js";
import { getDb } from "./queries/connection.js";
import { eq } from "drizzle-orm";
import { users } from "../db/schema.js";

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };

  try {
    // Try Kimi OAuth authentication first
    ctx.user = await authenticateRequest(opts.req.headers);
  } catch {
    // If Kimi auth fails, try local auth
    try {
      const cookieHeader = opts.req.headers.get("cookie") || "";
      const cookies = Object.fromEntries(
        cookieHeader.split("; ").filter(Boolean).map((c) => {
          const [k, ...v] = c.split("=");
          return [k, v.join("=")];
        }),
      );
      const token = cookies["kimi_sid"];
      if (token) {
        const claim = await verifySessionToken(token);
        if (claim?.unionId?.startsWith("local_")) {
          // Extract user ID from local token format: local_{userId}_{email}
          const parts = claim.unionId.split("_");
          const userId = parseInt(parts[1], 10);
          if (!isNaN(userId)) {
            const rows = await getDb()
              .select()
              .from(users)
              .where(eq(users.id, userId))
              .limit(1);
            if (rows[0]) {
              ctx.user = rows[0];
            }
          }
        }
      }
    } catch {
      // Local auth also failed — user is unauthenticated
    }
  }

  return ctx;
}
