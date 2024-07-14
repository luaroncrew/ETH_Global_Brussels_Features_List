"use client";

import { Check } from "lucide-react";
import { useContext, useState } from "react";
import { Button } from "~/components/ui/button";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Badge } from "../ui/badge";
import { UserContext } from "~/providers/user";
import Link from "next/link";
import { ROUTES } from "~/constants/routes";
import { PRICING_PLANS_ID } from "~/constants/billing";

const includedFeatures = [
  "Private forum access",
  "Member resources",
  "Entry to annual conference",
  "Official member t-shirt",
];

export const PricingSection = () => {
  const user = useContext(UserContext);
  const [isAnnualPlan, setIsAnnualPlan] = useState(true);

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto mb-20 max-w-2xl sm:text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Simple no-tricks pricing
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Distinctio et nulla eum soluta et neque labore quibusdam. Saepe et
            quasi iusto modi velit ut non voluptas in. Explicabo id ut laborum.
          </p>
        </div>
        <div className="mb-4 flex items-center justify-center">
          <Label htmlFor="payment-schedule" className="me-3">
            Monthly
          </Label>
          <Switch
            id="payment-schedule"
            checked={isAnnualPlan}
            defaultChecked={true}
            onCheckedChange={() => setIsAnnualPlan(!isAnnualPlan)}
          />
          <Label htmlFor="payment-schedule" className="relative ms-3">
            Annual
            <span className="absolute -end-28 -top-10 start-auto">
              <span className="flex items-center">
                <svg
                  className="-me-6 h-8 w-14"
                  width={45}
                  height={25}
                  viewBox="0 0 45 25"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M43.2951 3.47877C43.8357 3.59191 44.3656 3.24541 44.4788 2.70484C44.5919 2.16427 44.2454 1.63433 43.7049 1.52119L43.2951 3.47877ZM4.63031 24.4936C4.90293 24.9739 5.51329 25.1423 5.99361 24.8697L13.8208 20.4272C14.3011 20.1546 14.4695 19.5443 14.1969 19.0639C13.9242 18.5836 13.3139 18.4152 12.8336 18.6879L5.87608 22.6367L1.92723 15.6792C1.65462 15.1989 1.04426 15.0305 0.563943 15.3031C0.0836291 15.5757 -0.0847477 16.1861 0.187863 16.6664L4.63031 24.4936ZM43.7049 1.52119C32.7389 -0.77401 23.9595 0.99522 17.3905 5.28788C10.8356 9.57127 6.58742 16.2977 4.53601 23.7341L6.46399 24.2659C8.41258 17.2023 12.4144 10.9287 18.4845 6.96211C24.5405 3.00476 32.7611 1.27399 43.2951 3.47877L43.7049 1.52119Z"
                    fill="currentColor"
                    className="text-muted-foreground"
                  />
                </svg>
                <Badge className="mt-3 whitespace-nowrap uppercase">
                  Save more than 15%
                </Badge>
              </span>
            </span>
          </Label>
        </div>
        <div className="mx-auto max-w-2xl rounded-3xl ring-1 ring-gray-200 lg:flex lg:max-w-5xl">
          <div className="p-8 sm:p-10 lg:flex-auto">
            <h3 className="text-2xl font-bold tracking-tight text-gray-900">
              {isAnnualPlan ? "Annual" : "Monthly"} membership
            </h3>
            <p className="mt-6 text-base leading-7 text-gray-600">
              Lorem ipsum dolor sit amet consect etur adipisicing elit. Itaque
              amet indis perferendis blanditiis repellendus etur quidem
              assumenda.
            </p>
            <div className="mt-10 flex items-center gap-x-4">
              <h4 className="flex-none text-sm font-semibold leading-6">
                What’s included
              </h4>
              <div className="h-px flex-auto bg-gray-100" />
            </div>
            <ul
              role="list"
              className="mt-8 grid grid-cols-1 gap-4 text-sm leading-6 text-gray-600 sm:grid-cols-2 sm:gap-6"
            >
              {includedFeatures.map((feature) => (
                <li key={feature} className="flex gap-x-3">
                  <Check className="h-6 w-5 flex-none" aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          <div className="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
            <div className="rounded-2xl bg-gray-50 py-10 text-center ring-1 ring-inset ring-gray-900/5 lg:flex lg:flex-col lg:justify-center lg:py-16">
              <div className="mx-auto max-w-xs px-8">
                <p className="text-base font-semibold text-gray-600">
                  Start involving your users
                </p>
                <p className="mt-6 flex items-baseline justify-center gap-x-2">
                  <span className="text-5xl font-bold tracking-tight text-gray-900">
                    {isAnnualPlan ? "$395" : "$39"}
                  </span>
                  <span className="text-sm font-semibold leading-6 tracking-wide text-gray-400">
                    {isAnnualPlan ? "/year" : "/month"}
                  </span>
                </p>
                {user?.id ? (
                  <Button
                    className="mt-10 w-full"
                    onClick={() => console.log("Get access")}
                  >
                    Get access
                  </Button>
                ) : (
                  <Button className="mt-10 w-full" asChild>
                    <Link href={process.env.NEXT_PUBLIC_APP_BASE_URL!}>
                      Get access
                    </Link>
                  </Button>
                )}
                <p className="mt-6 text-xs leading-5 text-gray-600">
                  Invoices and receipts available for easy company reimbursement
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
