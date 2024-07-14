"use client";

import { type Feature } from "@prisma/client";
import { Fragment, useContext, useState, type SVGProps } from "react";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { UserContext } from "~/providers/user";
import { api } from "~/trpc/react";
import { CommentSection } from "./comment-section";
import { DeleteWarningDialog } from "./delete-warning-dialog";
import { usePathname } from "next/navigation";

export function FeaturesList({
  search,
  featureListId,
}: {
  search: string;
  featureListId: string;
}) {
  const { data } = api.feature.getByFeatureList.useQuery({ featureListId });
  if (!data) {
    return null;
  }
  const features = data.filter((feature) =>
    feature.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="grid gap-4">
      {features.map((feature: Feature, i: number) => (
        <Fragment key={feature.id}>
          <FeatureItem feature={feature} />
          {i !== data.length - 1 && <Separator />}
        </Fragment>
      ))}
    </div>
  );
}

const FeatureItem = ({
  feature: { id, title, description, upvotes, featureListId },
}: {
  feature: {
    id: string;
    title: string;
    description: string;
    upvotes: number;
    featureListId: string;
  };
}) => {
  const companyId = usePathname().split("/")[2];
  const user = useContext(UserContext);

  const [upvotesCount, setUpvotesCount] = useState(upvotes);
  const [isUpvoted, setIsUpvoted] = useState(
    !!user!.upvotedFeatures.find((f) => f.id === id),
  );
  const voteMutation = api.feature.vote.useMutation({
    onError: () => {
      setUpvotesCount(isUpvoted ? upvotesCount - 1 : upvotesCount + 1);
      setIsUpvoted(!isUpvoted);
    },
  });

  const apiUtils = api.useUtils();

  const handleVote = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    setUpvotesCount(isUpvoted ? upvotesCount - 1 : upvotesCount + 1);
    setIsUpvoted(!isUpvoted);
    e.preventDefault();
    voteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          apiUtils.user.me.invalidate().catch((error) => console.error(error));
          apiUtils.feature.getByFeatureList
            .invalidate({ featureListId })
            .catch((error) => console.error(error));
        },
      },
    );
  };

  const deleteFeatureMutation = api.feature.delete.useMutation();
  const handleDeleteFeature = () =>
    deleteFeatureMutation.mutate(
      { featureId: id },
      {
        onSuccess: () => {
          apiUtils.feature.getByFeatureList
            .invalidate({ featureListId })
            .catch((error) => console.error(error));
        },
      },
    );

  const [showCommentSection, setShowCommentSection] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between gap-8">
        <div>
          <h2 className="text-base font-bold">{title}</h2>
          {description && (
            <p className="mt-1.5 text-sm leading-none">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Button
            className="px-2 py-1"
            size="sm"
            variant="outline"
            style={{ backgroundColor: isUpvoted ? "#E2E8F0" : undefined }}
            onClick={(e) => handleVote(e)}
          >
            <ArrowUpIcon className="mr-2 h-4 w-4 stroke-2" />
            <span className="font-bold text-gray-900">{upvotesCount}</span>
          </Button>
          {user?.companyId === companyId && (
            <DeleteWarningDialog
              deleteCallback={handleDeleteFeature}
              description="This action cannot be undone. This will permanently delete the feature and remove all associated data from our servers."
            />
          )}
        </div>
      </div>
      <button
        onClick={() => setShowCommentSection(!showCommentSection)}
        className="mt-2.5 flex w-fit items-center text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
      >
        <span>Comments</span>
        <ChevronDownIcon className="ml-1 h-4 w-4" />
      </button>
      {showCommentSection && <CommentSection featureId={id} />}
    </div>
  );
};

function ArrowUpIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 7-7 7 7" />
      <path d="M12 19V5" />
    </svg>
  );
}

function ChevronDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
