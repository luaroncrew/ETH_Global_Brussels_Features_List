"use client";

import { type Company } from "@prisma/client";
import { Input } from "../ui/input";
import { type MutableRefObject, useContext, useEffect, useState } from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { ROUTES } from "~/constants/routes";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { UserContext, type UserWithUpvotedFeatures } from "~/providers/user";

export const SearchCompanySection = ({
  companies,
  authButton,
}: {
  companies: Company[];
  authButton: MutableRefObject<HTMLButtonElement | null>;
}) => {
  const user = useContext(UserContext);
  const createCompanyMutation = api.company.create.useMutation();
  const [search, setSearch] = useState<string>("");
  const router = useRouter();

  const filteredCompanies = companies.filter(({ domain }) =>
    domain.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
  );

  const createCompanyWithDomain = async () => {
    const { id } = await createCompanyMutation.mutateAsync({ domain: search });
    router.push(
      process.env.NEXT_PUBLIC_APP_BASE_URL + "/" + id + ROUTES.FEATURE_LISTS,
    );
  };

  return (
    <section className="flex w-full flex-col items-center justify-center py-12 md:py-24 lg:py-32 xl:py-48">
      <h1 className="mb-10 text-center text-4xl font-bold">
        Provide product&apos;s domain
      </h1>
      <div className="w-full max-w-96 space-y-1">
        <Input
          placeholder="domain.com"
          className="mb-2 pl-4"
          id="domain"
          onChange={(e) => setSearch(e.target.value)}
          value={search}
        />
        {filteredCompanies.length > 0 ? (
          filteredCompanies.map((company) => (
            <CompanyItem
              user={user}
              company={company}
              key={company.id}
              authButton={authButton}
            />
          ))
        ) : (
          <Button
            className="w-full"
            onClick={async () =>
              !user
                ? authButton.current!.click()
                : await createCompanyWithDomain()
            }
          >
            Create a board for this domain
          </Button>
        )}
      </div>
    </section>
  );
};

const CompanyItem = ({
  user,
  company,
  authButton,
}: {
  user: UserWithUpvotedFeatures | null;
  company: Company;
  authButton: MutableRefObject<HTMLButtonElement | null>;
}) => {
  if (!user) {
    return (
      <Button
        variant="secondary"
        className="h-10 w-full justify-start hover:bg-gray-200"
        onClick={() => authButton.current!.click()}
      >
        {company.domain}
      </Button>
    );
  }
  return (
    <Button
      variant="secondary"
      className="h-10 w-full justify-start hover:bg-gray-200"
      asChild
    >
      <Link href={"/app/" + company.id + ROUTES.FEATURE_LISTS}>
        {company.domain}
      </Link>
    </Button>
  );
};
