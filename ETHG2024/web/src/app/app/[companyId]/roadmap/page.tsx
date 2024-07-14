"use client";

import { useParams } from "next/navigation";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { STATUS_IN_ROADMAP, STATUS_LABEL } from "~/constants/status";
import { api } from "~/trpc/react";

export default function Roadmap() {
  const params = useParams();

  if (!params.companyId || typeof params.companyId !== "string") {
    return null;
  }

  const { data: featureByStatus } = api.feature.getByCompany.useQuery({
    companyId: params.companyId,
  });
  const { data: featureLists } = api.featureList.getByCompany.useQuery({
    companyId: params.companyId,
  });

  return (
    <div className="flex justify-between gap-x-8">
      {STATUS_IN_ROADMAP.map((status) => {
        return (
          <div key={status} className="w-80 space-y-2">
            <div className="mb-4 font-bold">{STATUS_LABEL[status]}</div>
            {featureByStatus?.[status]?.map((feature) => {
              return (
                <Card key={feature.id} className="rounded-md">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 text-sm text-gray-400">
                    <p className="mb-4 line-clamp-2">{feature.description}</p>
                    <Badge className="bg-slate-400 hover:bg-slate-400">
                      {
                        featureLists?.find(
                          (l) => l.id === feature.featureListId,
                        )?.name
                      }
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
