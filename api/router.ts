import { authRouter } from "./auth-router.js";
import { orderRouter } from "./order-router.js";
import { createRouter, publicQuery } from "./middleware.js";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  order: orderRouter,
});

export type AppRouter = typeof appRouter;