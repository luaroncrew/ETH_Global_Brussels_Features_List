import { featureRouter } from "~/server/api/routers/feature";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { userRouter } from "./routers/user";
import { commentRouter } from "./routers/comment";
import { featureListRouter } from "./routers/feature-list";
import { companyRouter } from "./routers/company";
import { rewardPoolRouter } from "./routers/rewardPool";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  feature: featureRouter,
  featureList: featureListRouter,
  user: userRouter,
  comment: commentRouter,
  company: companyRouter,
  rewardPool: rewardPoolRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
