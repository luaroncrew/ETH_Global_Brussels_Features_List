import { z } from "zod";
import { TRPCError } from "@trpc/server";

import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

export const featureListRouter = createTRPCRouter({
  getByCompany: publicProcedure
    .input(z.object({ companyId: z.string() }))
    .query(async ({ ctx, input }) => {
      // TODO - Replace with
      /*
      return await ctx.db.feature.groupBy({
        by: ["status"],
        where: { companyId: input.companyId },
      });
      */
      return await ctx.db.featureList.findMany({
        where: { companyId: input.companyId },
        include: { features: true },
      });
    }),

  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string(),
        companyId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.featureList.create({
        data: {
          name: input.name,
          description: input.description,
          company: { connect: { id: input.companyId } },
        },
      });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const featureListToDelete = await ctx.db.featureList.findFirstOrThrow({
        where: { id: input.id },
      });
      if (featureListToDelete.companyId !== ctx.session.user.companyId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not allowed to do this operation.",
        });
      }

      return await ctx.db.featureList.delete({
        where: {
          id: input.id,
        },
      });
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().optional(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const featureListToUpdate = await ctx.db.featureList.findFirstOrThrow({
        where: { id: input.id },
      });
      if (featureListToUpdate.companyId !== ctx.session.user.companyId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not allowed to do this operation.",
        });
      }

      return await ctx.db.featureList.update({
        where: {
          id: input.id,
        },
        data: input,
      });
    }),
});
