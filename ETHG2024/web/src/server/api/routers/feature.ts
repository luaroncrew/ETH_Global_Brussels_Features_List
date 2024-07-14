import { z } from "zod";
import { Status } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const featureRouter = createTRPCRouter({
  getByFeatureList: publicProcedure
    .input(z.object({ featureListId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.feature.findMany({
        where: {
          featureListId: input.featureListId,
          status: Status.DISCUSSED,
        },
      });
    }),

  getByCompany: publicProcedure
    .input(z.object({ companyId: z.string() }))
    .query(async ({ ctx, input }) => {
      const features = await ctx.db.feature.findMany({
        where: { featureList: { companyId: input.companyId } },
      });

      return features.reduce(
        (acc, feature) => {
          if (!acc[feature.status]) {
            acc[feature.status] = [];
          }
          acc[feature.status].push(feature);
          return acc;
        },
        {} as Record<Status, typeof features>,
      );
    }),

  vote: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const feature = await ctx.db.feature.findUniqueOrThrow({
        where: { id: input.id },
        include: { upvoters: true },
      });
      if (feature.status !== Status.DISCUSSED) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not allowed to do this operation.",
        });
      }

      const wasUpvoters = feature.upvoters.find(
        (voters) => voters.id === ctx.session.user.id,
      );

      await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          upvotedFeatures: wasUpvoters
            ? { disconnect: { id: input.id } }
            : { connect: { id: input.id } },
        },
      });

      return await ctx.db.feature.update({
        where: { id: input.id },
        data: {
          upvotes: wasUpvoters ? feature.upvotes - 1 : feature.upvotes + 1,
        },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        featureListId: z.string().uuid(),
        title: z.string().min(1),
        description: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.feature.create({
        data: {
          title: input.title,
          description: input.description,
          status: Status.DISCUSSED,
          createdBy: { connect: { id: ctx.session.user.id } },
          featureList: {
            connect: { id: input.featureListId },
          },
        },
      });
    }),

  delete: adminProcedure
    .input(z.object({ featureId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { featureList } = await ctx.db.feature.findFirstOrThrow({
        where: { id: input.featureId },
        include: { featureList: true },
      });

      if (featureList.companyId !== ctx.session.user.companyId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not allowed to do this operation.",
        });
      }

      return await ctx.db.feature.delete({
        where: {
          id: input.featureId,
        },
      });
    }),

  updateStatus: adminProcedure
    .input(z.object({ id: z.string().uuid(), status: z.nativeEnum(Status) }))
    .mutation(async ({ ctx, input }) => {
      const { featureList } = await ctx.db.feature.findFirstOrThrow({
        where: { id: input.id },
        include: { featureList: true },
      });

      if (featureList.companyId !== ctx.session.user.companyId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not allowed to do this operation.",
        });
      }

      return await ctx.db.feature.update({
        where: { id: input.id },
        data: { status: input.status },
      });
    }),
});
