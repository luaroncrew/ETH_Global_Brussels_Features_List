"use client";

import Link from "next/link";
import { ROUTES } from "~/constants/routes";
import { UserContext } from "~/providers/user";
import { AlignStartHorizontal, Settings, LayoutList } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useParams, usePathname } from "next/navigation";
import { useContext } from "react";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { Logo } from "~/icons/logo";

const APP_NAVIGATION_TABS = [
  {
    label: "Roadmap",
    slug: ROUTES.ROADMAP,
    Icon: AlignStartHorizontal,
    adminOnly: false,
  },
  {
    label: "Feature Lists",
    slug: ROUTES.FEATURE_LISTS,
    Icon: LayoutList,
    adminOnly: false,
  },
  {
    label: "Settings",
    slug: ROUTES.SETTINGS,
    Icon: Settings,
    adminOnly: true,
  },
];

export const Navigation = () => {
  const companyId = usePathname().split("/")[2];
  const user = useContext(UserContext);

  return (
    <header className="mb-2 flex w-full items-center justify-between">
      <Link className="flex items-center justify-center" href="/">
        <Logo className="h-6 w-6" />
        <span className="sr-only">FeaturesList</span>
      </Link>
      <div className="flex items-center gap-x-2">
        <nav className="flex gap-x-2">
          {APP_NAVIGATION_TABS.filter(
            (tab) => !tab.adminOnly || user?.companyId === companyId,
          ).map((tab) => (
            <TabNavigationItem
              key={tab.slug}
              label={tab.label}
              slug={tab.slug}
              Icon={tab.Icon}
            />
          ))}
        </nav>
        <DynamicWidget />
      </div>
    </header>
  );
};

const TabNavigationItem = ({
  label,
  slug,
  Icon,
}: {
  label: string;
  slug: string;
  Icon: React.ComponentType<{
    className?: string;
  }>;
}) => {
  const params = useParams();
  const urlPath = usePathname();

  if (!params.companyId || typeof params.companyId !== "string") {
    return null;
  }

  return (
    <Button asChild variant={urlPath.endsWith(slug) ? "secondary" : "ghost"}>
      <Link
        href={`${process.env.NEXT_PUBLIC_APP_BASE_URL}/${params.companyId}${slug}`}
        className="flex items-center"
      >
        <Icon className="mr-2 h-4 w-4" />
        {label}
      </Link>
    </Button>
  );
};
