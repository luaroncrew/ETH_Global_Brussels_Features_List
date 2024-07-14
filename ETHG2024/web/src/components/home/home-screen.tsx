"use client";

import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import Link from "next/link";
import { useRef } from "react";
import { Logo } from "~/icons/logo";
import { Button } from "../ui/button";
import { type Company } from "@prisma/client";
import { SearchCompanySection } from "./search-company-section";

export const HomeScreen = ({ companies }: { companies: Company[] }) => {
  const authButton = useRef<HTMLButtonElement | null>(null);

  return (
    <>
      <header className="flex h-16 items-center px-4 py-2 lg:px-6">
        <Link className="flex items-center justify-center" href="/">
          <Logo className="h-6 w-6" />
          <span className="sr-only">FeaturesList</span>
        </Link>
        <nav className="ml-auto flex items-center gap-x-8 sm:gap-6">
          <Link
            className="text-sm font-medium underline-offset-4 hover:underline"
            href="/about"
          >
            About
          </Link>
          <DynamicWidget
            innerButtonComponent={
              <Button ref={authButton}>Log in or sign up</Button>
            }
          />
        </nav>
      </header>
      <main className="flex-1">
        <SearchCompanySection companies={companies} authButton={authButton} />
      </main>
    </>
  );
};
