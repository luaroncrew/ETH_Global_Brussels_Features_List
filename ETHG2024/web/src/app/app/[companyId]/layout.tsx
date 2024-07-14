import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Navigation } from "~/components/app/navigation";
import { Badge } from "~/components/ui/badge";
import { ROUTES } from "~/constants/routes";
import { api } from "~/trpc/server";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = headers().get("x-url");
  const companyId = pathname?.split("/app/")[1]?.split("/")[0];

  if (!companyId) {
    return redirect("/");
  }

  const { admins, domain } = await api.company.getByInputId({ id: companyId });

  let isHabilited;
  try {
    isHabilited = await api.user.checkHabilitationForCompany({
      companyId,
    });

    if (!isHabilited) {
      return redirect("/");
    }
  } catch (error) {
    return redirect("/");
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8 pt-6">
      <div className="w-full max-w-5xl">
        <Navigation />
        <div className="mb-4 flex items-center gap-x-2">
          <h1 className="text-3xl font-bold">{domain}</h1>
          {admins?.length > 0 ? (
            <Badge
              variant="outline"
              className="mt-1.5 border-green-700 bg-green-200 text-green-700"
            >
              Verified
            </Badge>
          ) : (
            <Link
              href={
                process.env.NEXT_PUBLIC_APP_BASE_URL +
                "/" +
                companyId +
                ROUTES.VERIFY_OWNERSHIP
              }
            >
              <Badge
                variant="outline"
                className="mt-1.5 border-pink-700 bg-pink-200 text-pink-700"
              >
                Cick here to claim ownership
              </Badge>
            </Link>
          )}
        </div>
        {children}
      </div>
    </main>
  );
}
