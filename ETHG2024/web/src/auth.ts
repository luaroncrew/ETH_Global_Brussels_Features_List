import NextAuth from "next-auth";

import type { NextAuthConfig } from "next-auth";

import { validateJWT } from "./lib/authHelpers";
import Credentials from "next-auth/providers/credentials";
import { ROUTES } from "./constants/routes";
import { api } from "./trpc/server";

type User = {
  id: string;
  name: string;
  email: string;
  isNewUser: boolean;
  walletAddress: string;
  // Add other fields as needed
};

export const config = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        token: { label: "Token", type: "text" },
      },
      async authorize(
        credentials: Partial<Record<"token", unknown>>,
        request: Request,
      ): Promise<User | null> {
        const token = credentials.token as string; // Safely cast to string; ensure to handle undefined case
        if (typeof token !== "string" || !token) {
          throw new Error("Token is required");
        }
        const jwtPayload = await validateJWT(token);

        if (jwtPayload) {
          // Transform the JWT payload into your user object
          const user: User = {
            id: jwtPayload.sub ?? "", // Assuming 'sub' is the user ID
            name: (jwtPayload?.name as string) || "", // Replace with actual field from JWT payload
            email: (jwtPayload?.email as string) || "", // Replace with actual field from JWT payload
            isNewUser: (jwtPayload?.new_user as boolean) ?? false,
            walletAddress: (
              jwtPayload?.verified_credentials as {
                address: string;
              }[]
            )[0]!.address,
            // Map other fields as needed
          };
          return user;
        } else {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if ((user as User).isNewUser) {
        await fetch("http://localhost:3000/api/user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.email,
            name: user.name,
            id: user.id,
            walletAddress: (user as User).walletAddress,
          }),
        }).then((res) => res.json());
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        // User is available during sign-in
        token.id = user.id;
        token.isNewUser = (user as User & { isNewUser: boolean }).isNewUser;
      }
      return token;
    },
    session: ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub,
          isNewUser: token.isNewUser,
        },
      };
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
