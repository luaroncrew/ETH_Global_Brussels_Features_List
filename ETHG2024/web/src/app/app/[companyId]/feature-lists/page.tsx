"use client";

import { Search } from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import { useContext, useState } from "react";
import { Toaster } from "sonner";
import { CreateFeatureDialog } from "~/components/app/feature-lists/create-feature-dialog";
import { CreateFeatureListDialog } from "~/components/app/feature-lists/create-feature-list-dialog";
import { DeleteWarningDialog } from "~/components/app/feature-lists/delete-warning-dialog";
import { FeaturesList } from "~/components/app/feature-lists/features-list";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { UserContext } from "~/providers/user";
import { api } from "~/trpc/react";

export default function FeaturesLists() {
  const user = useContext(UserContext);
  const params = useParams();
  const [search, setSearch] = useState("");
  const [selectedFeatureListIndex, setSelectedFeatureListIndex] = useState(0);
  const companyId = usePathname().split("/")[2];

  if (!params.companyId || typeof params.companyId !== "string") {
    return null;
  }

  const apiUtils = api.useUtils();
  const deleteFeatureListMutation = api.featureList.delete.useMutation();

  const { data: featureLists } = api.featureList.getByCompany.useQuery({
    companyId: params.companyId,
  });

  // if (!featureLists || featureLists.length === 0) {
  //   return null;
  // }

  return (
    <>
      <div className="flex w-full justify-between gap-x-10">
        <div className="flex w-64 flex-col gap-1.5">
          <h3 className="text-xl font-bold">Lists</h3>
          {featureLists?.map((list, i) => (
            <div key={list.id} className="relative">
              <Button
                variant={i === selectedFeatureListIndex ? "secondary" : "ghost"}
                className="h-10 w-full justify-start"
                onClick={() => setSelectedFeatureListIndex(i)}
              >
                {list.name}
              </Button>
              {user?.companyId === companyId && (
                <DeleteWarningDialog
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  description="This action cannot be undone. This will permanently delete the feature list and remove all associated data from our servers."
                  deleteCallback={() => {
                    deleteFeatureListMutation.mutate(
                      { id: list.id },
                      {
                        onSuccess: () => {
                          apiUtils.featureList.getByCompany
                            .invalidate({
                              companyId: params.companyId as string,
                            })
                            .catch((error) => console.error(error));
                        },
                      },
                    );
                  }}
                />
              )}
            </div>
          ))}
          {user?.companyId === companyId && (
            <CreateFeatureListDialog
              companyId={params.companyId}
              className="h-10"
            />
          )}
        </div>
        <div className="w-full max-w-[720px]">
          <div className=" mb-6 space-y-8 lg:space-y-12">
            <div className="grid gap-1">
              <h1 className="text-3xl font-bold">
                {featureLists?.[selectedFeatureListIndex]?.name}
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                {featureLists?.[selectedFeatureListIndex]?.description}
              </p>
            </div>
          </div>
          {featureLists && featureLists.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search"
                    className="pl-8"
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <CreateFeatureDialog
                  featureListId={featureLists[selectedFeatureListIndex]!.id}
                />
              </div>
              <Separator />
              <FeaturesList
                featureListId={featureLists[selectedFeatureListIndex]!.id}
                search={search}
              />
            </div>
          )}
        </div>
      </div>
      <Toaster />
    </>
  );
}
