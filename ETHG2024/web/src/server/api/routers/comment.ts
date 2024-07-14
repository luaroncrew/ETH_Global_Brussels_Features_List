import { z } from "zod";
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const commentRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        featureId: z.string().uuid(),
        content: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.comment.create({
        data: {
          featureId: input.featureId,
          content: input.content,
          userId: ctx.session.user.id!,
        },
      });
    }),
  getByFeatureId: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      return await ctx.db.comment.findMany({
        where: {
          featureId: input,
        },
        orderBy: {
          createdAt: "asc",
        },
        include: {
          user: true,
        },
      });
    }),

  delete: adminProcedure
    .input(z.object({ commentId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.comment.delete({ where: { id: input.commentId } });
    }),
});
