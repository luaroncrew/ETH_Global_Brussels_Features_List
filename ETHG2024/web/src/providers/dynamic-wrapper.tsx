"use client";

import { getCsrfToken, getSession, signOut } from "next-auth/react";
import {
  DynamicContextProvider,
  EthereumWalletConnectors,
  DynamicWagmiConnector,
} from "~/lib/dynamic";

import { WagmiProvider } from "wagmi";

import { http, createConfig } from "wagmi";
import { sepolia } from "wagmi/chains";
import { api } from "~/trpc/react";

export const config = createConfig({
  chains: [sepolia],
  multiInjectedProviderDiscovery: false,
  ssr: true,
  transports: {
    [sepolia.id]: http(),
  },
});

export default function DynamicProviderWrapper({
  children,
}: React.PropsWithChildren) {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID!,
        walletConnectors: [EthereumWalletConnectors],
        events: {
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onLogout: async () => {
            await signOut({ callbackUrl: "/" });
          },
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onAuthSuccess: async (event) => {
            const { authToken } = event;

            const csrfToken = await getCsrfToken();

            fetch("/api/auth/callback/credentials", {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: `csrfToken=${encodeURIComponent(
                csrfToken,
              )}&token=${encodeURIComponent(authToken)}`,
            })
              .then(async (res) => {
                if (res.ok) {
                  await getSession();
                  window.location.reload();
                } else {
                  console.error("Failed to log in");
                }
              })
              .catch((error) => {
                // Handle any exceptions
                console.error("Error logging in", error);
              });
          },
        },
      }}
    >
      <WagmiProvider config={config}>
        <DynamicWagmiConnector>{children}</DynamicWagmiConnector>
      </WagmiProvider>
    </DynamicContextProvider>
  );
}
