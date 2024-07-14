"use client";

import { format } from "date-fns";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { useConfig, useWriteContract } from "wagmi";
import { MANAGER_CONTRACT_ABI, USDC_CONTRACT_ABI } from "~/constants/abi";
import { useRef, useState } from "react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { getEnsAddress } from "@wagmi/core";
import { api } from "~/trpc/react";
import { usePathname } from "next/navigation";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { Badge } from "~/components/ui/badge";
import Link from "next/link";
import { ROUTES } from "~/constants/routes";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "~/components/ui/calendar";

const SEPOLIA_USDC_ADDRESS = "0xF466b60fa4b768C8b6C5b29AB6FEB1926Eec022f";

const SUBSCRIPTION_AMOUNT = 10;

const WEI_BY_ETH = 1000000000000000000;

export default function VerifyOwnership() {
  const { writeContract, writeContractAsync } = useWriteContract();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const config = useConfig();
  const pathname = usePathname();
  const companyId = pathname.split("/")[2];

  const { primaryWallet } = useDynamicContext();
  const [isDomainVerified, setIsDomainVerified] = useState(false);
  const [hasSubscribed, setHasSubscribed] = useState(false);
  const [isRewardPoolFilled, setIsRewardPoolFilled] = useState(false);
  const [date, setDate] = useState<Date>();

  const setCompanyAdminMutation = api.company.setAdmin.useMutation();
  const createRewardPoolMutation = api.rewardPool.create.useMutation();

  const { data } = api.company.getByInputId.useQuery({ id: companyId! });

  const sendApproveTransaction = (amount: number) => {
    writeContract({
      abi: USDC_CONTRACT_ABI,
      address: SEPOLIA_USDC_ADDRESS,
      functionName: "approve",
      args: [
        "0x01Ae61503c4f1C51b32C77871C86595D7b4E97E1",
        BigInt(amount) * BigInt(WEI_BY_ETH),
      ],
    });
  };

  const sendSubscriptionTransaction = async () => {
    const hash = await writeContractAsync({
      abi: MANAGER_CONTRACT_ABI,
      address: "0x01Ae61503c4f1C51b32C77871C86595D7b4E97E1",
      functionName: "subscribe",
    });

    if (hash) {
      await setCompanyAdminMutation.mutateAsync({
        companyId: companyId!,
        walletAddress: primaryWallet!.address,
      });

      setHasSubscribed(true);
    }
  };

  const sendRewardTransaction = async () => {
    if (!inputRef.current!.value || !date || !companyId) {
      return;
    }

    const hash = await writeContractAsync({
      abi: MANAGER_CONTRACT_ABI,
      address: "0x01Ae61503c4f1C51b32C77871C86595D7b4E97E1",
      functionName: "createPool",
      args: [
        companyId,
        BigInt(inputRef.current!.value) * BigInt(WEI_BY_ETH),
        BigInt(date.getTime() / 1000),
      ],
    });

    if (hash) {
      await createRewardPoolMutation.mutateAsync({
        companyId: companyId,
        totalAmount: Number.parseInt(inputRef.current!.value),
        distributionDate: date,
        txHash: hash,
      });
      setIsRewardPoolFilled(true);
    }
  };

  return (
    <main className="flex flex-col">
      <section className="space-y-2 px-4 py-8">
        <div className="flex items-center gap-x-4">
          <h3 className="text-2xl font-bold">1. Verify domain ownership</h3>
          {isDomainVerified && (
            <Badge
              variant="outline"
              className="mt-1 border-green-700 bg-green-200 text-green-700"
            >
              Verified
            </Badge>
          )}
        </div>
        {!isDomainVerified && (
          <Button
            onClick={async () => {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-call
              const domainOwnerAddress = await getEnsAddress(config, {
                name: data!.domain,
              });
              if (domainOwnerAddress === primaryWallet?.address) {
                setIsDomainVerified(true);
              }
            }}
          >
            Verify
          </Button>
        )}
      </section>
      <Separator />
      <section className="space-y-2 px-4 py-8">
        <div className="flex items-center gap-x-4">
          <h3 className="text-2xl font-bold">2. Subscribe</h3>
          {hasSubscribed && (
            <Badge
              variant="outline"
              className="mt-1 border-green-700 bg-green-200 text-green-700"
            >
              Subscribed
            </Badge>
          )}
        </div>
        {!hasSubscribed && (
          <>
            <Button
              disabled={!isDomainVerified}
              onClick={() => sendApproveTransaction(SUBSCRIPTION_AMOUNT)}
              className="mr-4"
            >
              Approve
            </Button>
            <Button
              disabled={!isDomainVerified}
              onClick={async () => await sendSubscriptionTransaction()}
            >
              Subscribe
            </Button>
          </>
        )}
      </section>
      <Separator />
      <section className="space-y-2 px-4 py-8">
        <div className="flex items-center gap-x-4">
          <h3 className="text-2xl font-bold">3. Fill reward pool</h3>
          {isRewardPoolFilled && (
            <Badge
              variant="outline"
              className="mt-1 border-green-700 bg-green-200 text-green-700"
            >
              Reward pool filled
            </Badge>
          )}
        </div>
        {!isRewardPoolFilled && (
          <div className="flex items-end gap-x-4">
            <Label htmlFor="rewardAmount">
              Reward Pool Amount in USDC
              <Input
                ref={inputRef}
                type="number"
                id="rewardAmount"
                className="mr-2 mt-2 w-56"
                disabled={!isDomainVerified}
              />
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  disabled={!hasSubscribed}
                  variant={"outline"}
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <div className="flex items-end gap-x-2">
              <Button
                disabled={!isDomainVerified || !hasSubscribed}
                onClick={() =>
                  sendApproveTransaction(
                    Number.parseInt(inputRef.current!.value),
                  )
                }
              >
                Approve
              </Button>
              <Button
                disabled={!isDomainVerified || !hasSubscribed}
                onClick={async () => await sendRewardTransaction()}
              >
                Fill
              </Button>
            </div>
          </div>
        )}
      </section>
      {hasSubscribed ? (
        <Button
          className="mt-4 self-end"
          onClick={() =>
            setCompanyAdminMutation.mutate({
              companyId: companyId!,
              walletAddress: primaryWallet!.address,
            })
          }
        >
          <Link
            href={
              process.env.NEXT_PUBLIC_APP_BASE_URL +
              "/" +
              companyId +
              ROUTES.FEATURE_LISTS
            }
          >
            Go to Dashboard
          </Link>
        </Button>
      ) : (
        <Button disabled className="mt-4 self-end">
          Go to Dashboard
        </Button>
      )}
    </main>
  );
}
