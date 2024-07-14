import "~/styles/globals.css";

import { Inter } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { api } from "~/trpc/server";
import UserProvider from "~/providers/user";
import { auth } from "~/auth";
import DynamicProviderWrapper from "~/providers/dynamic-wrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "FeaturesList",
  description: "Build features your users really want",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  let user = null;
  if (session) {
    user = await api.user.me();
  }

  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable}`}>
        <TRPCReactProvider>
          <DynamicProviderWrapper>
            <UserProvider user={user}>{children}</UserProvider>
          </DynamicProviderWrapper>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
