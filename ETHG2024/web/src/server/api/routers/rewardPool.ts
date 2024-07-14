import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const rewardPoolRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        totalAmount: z.number(),
        distributionDate: z.date(),
        companyId: z.string().uuid(),
        txHash: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.rewardPool.create({
        data: {
          totalAmount: input.totalAmount,
          distributionDate: input.distributionDate,
          txHash: input.txHash,
          company: {
            connect: {
              id: input.companyId,
            },
          },
        },
      });
    }),
});
