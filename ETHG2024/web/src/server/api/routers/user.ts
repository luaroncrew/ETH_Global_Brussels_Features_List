import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  me: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
      include: {
        upvotedFeatures: true,
      },
    });
  }),
  create: publicProcedure
    .input(
      z.object({
        email: z.string(),
        name: z.string(),
        id: z.string().uuid(),
        walletAddress: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.user.create({
        data: {
          email: input.email,
          name: input.name,
          id: input.id,
          walletAddress: input.walletAddress,
        },
      });
    }),
  checkHabilitationForCompany: protectedProcedure
    .input(z.object({ companyId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { allowedUserEmails, isPrivate } =
        await ctx.db.company.findUniqueOrThrow({
          where: { id: input.companyId },
        });

      if (!ctx.session.user.email) {
        return false;
      }

      return !isPrivate || allowedUserEmails.includes(ctx.session.user.email);
    }),
});
