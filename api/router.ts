import { authRouter } from "./auth-router";
import { orderRouter } from "./order-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  order: orderRouter,
});

export type AppRouter = typeof appRouter;
