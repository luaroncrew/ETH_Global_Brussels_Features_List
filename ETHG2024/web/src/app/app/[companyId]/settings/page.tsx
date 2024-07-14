"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { DeleteWarningDialog } from "~/components/app/feature-lists/delete-warning-dialog";
import { AllowUserDialog } from "~/components/app/settings/allow-user-dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Switch } from "~/components/ui/switch";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { api } from "~/trpc/react";

export default function Settings() {
  return <VisibilitySettingSection />;
}

const VisibilitySettingSection = () => {
  const { data: company } = api.company.getById.useQuery();

  const [isPrivate, setIsPrivate] = useState(company?.isPrivate);

  useEffect(() => {
    setIsPrivate(company?.isPrivate);
  }, [company]);
  const apiUtils = api.useUtils();
  const removeAllowedUserMutation = api.company.removeAllowedUser.useMutation({
    onSuccess: async () => {
      await apiUtils.company.getById.invalidate();
    },
  });
  const updateCompanyPrivacyMutation = api.company.updatePrivacy.useMutation({
    onError: () => {
      setIsPrivate(!isPrivate);
    },
  });

  const [search, setSearch] = useState("");

  if (!company) {
    return null;
  }

  const allowedUserEmails = company.allowedUserEmails.filter((email) =>
    email.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
  );

  return (
    <div className="w-full max-w-xl">
      <div className="mb-4 flex w-60 items-center justify-between">
        <Label htmlFor="is-private">Private feature list</Label>
        <Switch
          id="is-private"
          checked={isPrivate}
          onCheckedChange={() => {
            setIsPrivate(!isPrivate);
            updateCompanyPrivacyMutation.mutate({ isPrivate: !isPrivate });
          }}
        />
      </div>
      {isPrivate && (
        <>
          <div className="flex justify-between">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search"
                className="pl-8"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <AllowUserDialog />
          </div>
          <Separator className="mt-4" />
          <Table>
            <TableCaption>The list of allowed users.</TableCaption>
            <TableHeader>
              <TableRow className="hover:bg-inherit">
                <TableHead>Email</TableHead>
                <TableHead className="w-14" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {allowedUserEmails.map((email) => (
                <TableRow key={email} className="hover:bg-inherit">
                  <TableCell>{email}</TableCell>
                  <TableCell>
                    <DeleteWarningDialog
                      description="This action cannot be undone. This will permanently remove the access to the selected user. You'll still be able to allow this user back by adding it to the list."
                      deleteCallback={() =>
                        removeAllowedUserMutation.mutate({
                          allowedUserEmailToRemove: email,
                        })
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow className="hover:bg-transparent">
                <TableCell>Total</TableCell>
                <TableCell>{allowedUserEmails.length}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </>
      )}
    </div>
  );
};
