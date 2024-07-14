import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const companyRouter = createTRPCRouter({
  getById: adminProcedure.query(async ({ ctx }) => {
    return await ctx.db.company.findUniqueOrThrow({
      where: {
        id: ctx.session.user.companyId,
      },
    });
  }),
  getByInputId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.company.findUniqueOrThrow({
        where: {
          id: input.id,
        },
        include: { admins: true },
      });
    }),

  setAdmin: protectedProcedure
    .input(
      z.object({ companyId: z.string().uuid(), walletAddress: z.string() }),
    )
    .mutation(async ({ ctx, input }) => {
      //TODO - check ownership by quering api
      // const {domain} = await ctx.db.company.findUnique({where: {id: input.companyId}})

      return await ctx.db.company.update({
        where: { id: input.companyId },
        data: { admins: { connect: { id: ctx.session.user.id } } },
      });
    }),

  getAccessibleCompanies: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.company.findMany({
      where: {
        OR: [
          {
            isPrivate: false,
          },
          {
            allowedUserEmails: {
              has: ctx.session.user.email,
            },
          },
        ],
      },
    });
  }),

  updatePrivacy: adminProcedure
    .input(z.object({ isPrivate: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.company.update({
        where: {
          id: ctx.session.user.companyId,
        },
        data: {
          isPrivate: input.isPrivate,
        },
      });
    }),

  removeAllowedUser: protectedProcedure
    .input(z.object({ allowedUserEmailToRemove: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUniqueOrThrow({
        where: { id: ctx.session.user.id },
        include: { company: true },
      });

      if (!user.companyId || !user.company || !user.company.isPrivate) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not allowed to do this operation.",
        });
      }

      return await ctx.db.company.update({
        where: {
          id: user.companyId,
        },
        data: {
          allowedUserEmails: {
            set: user.company.allowedUserEmails.filter(
              (email) => email !== input.allowedUserEmailToRemove,
            ),
          },
        },
      });
    }),

  addAllowedUser: protectedProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUniqueOrThrow({
        where: { id: ctx.session.user.id },
        include: { company: true },
      });

      if (!user.companyId || !user.company || !user.company.isPrivate) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not allowed to do this operation.",
        });
      }
      if (
        user.company.allowedUserEmails.find((email) => email === input.email)
      ) {
        return user.company;
      }
      return await ctx.db.company.update({
        where: { id: user.companyId },
        data: { allowedUserEmails: { push: input.email } },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        isPrivate: z.boolean().optional(),
        domain: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.company.create({
        data: {
          name: input.name,
          isPrivate: input.isPrivate ?? false,
          domain: input.domain,
          featureList: {
            create: {
              name: "Default list",
              description:
                "This is the default board where you'll find every feature suggestions, bug reports, integration requests...",
            },
          },
        },
      });
    }),
  getAllPublic: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.company.findMany({
      where: { isPrivate: false },
    });
  }),
});
