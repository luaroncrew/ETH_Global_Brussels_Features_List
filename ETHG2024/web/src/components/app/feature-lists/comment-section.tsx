"use client";

import { api } from "~/trpc/react";
import { toast } from "sonner";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Textarea } from "~/components/ui/textarea";
import { DeleteWarningDialog } from "./delete-warning-dialog";
import { useContext } from "react";
import { UserContext } from "~/providers/user";
import { usePathname } from "next/navigation";

export const CommentSection = ({ featureId }: { featureId: string }) => {
  const { data } = api.comment.getByFeatureId.useQuery(featureId);
  if (!data) {
    return null;
  }
  const comments = data.map((comment) => ({
    id: comment.id,
    name: comment.user.name,
    content: comment.content,
    date: comment.createdAt,
  }));

  return (
    <div className="ml-4 mt-2.5 space-y-4">
      {comments.map((comment) => (
        <Comment key={comment.id} comment={comment} featureId={featureId} />
      ))}
      <AddComment featureId={featureId} />
    </div>
  );
};

const Comment = ({
  comment,
  featureId,
}: {
  comment: {
    id: string;
    name: string | null;
    content: string;
    date: Date;
  };
  featureId: string;
}) => {
  const companyId = usePathname().split("/")[2];
  const user = useContext(UserContext);
  const apiUtils = api.useUtils();
  const deleteCommentMutation = api.comment.delete.useMutation({
    onSuccess: async () => {
      await apiUtils.comment.getByFeatureId.invalidate(featureId);
    },
  });

  return (
    <div className="relative space-y-2">
      <div className="flex items-center gap-2">
        <Image
          alt="Avatar"
          className="rounded-full"
          height="32"
          src="/placeholder.svg"
          style={{
            aspectRatio: "32/32",
            objectFit: "cover",
          }}
          width="32"
        />
        <div>
          <h4 className="text-sm font-semibold">{comment.name ?? "unknown"}</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {comment.date.toLocaleDateString()}
          </p>
        </div>
      </div>
      <p className="text-sm">{comment.content}</p>
      {user?.companyId === companyId && (
        <DeleteWarningDialog
          className="absolute right-1 top-1"
          description="This action cannot be undone. This will permanently delete the comment."
          deleteCallback={() =>
            deleteCommentMutation.mutate({ commentId: comment.id })
          }
        />
      )}
    </div>
  );
};

const MessageFormSchema = z.object({
  comment: z.string().min(1, {
    message: "A comment is required.",
  }),
});

const AddComment = ({ featureId }: { featureId: string }) => {
  const createCommentMutation = api.comment.create.useMutation();
  const form = useForm<z.infer<typeof MessageFormSchema>>({
    resolver: zodResolver(MessageFormSchema),
    defaultValues: {
      comment: "",
    },
  });

  const apiUtils = api.useUtils();

  function addComment(comment: z.infer<typeof MessageFormSchema>) {
    createCommentMutation.mutate(
      {
        featureId,
        content: comment.comment,
      },
      {
        onSuccess: () => {
          toast("Comment was published", {
            //TODO: Implement undo action
            action: {
              label: "Undo",
              onClick: () => console.log("Undo"),
            },
          });

          apiUtils.comment.getByFeatureId
            .invalidate(featureId)
            .catch(console.error);
          form.reset();
        },
      },
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(addComment)}
        className="w-2/3 space-y-3"
      >
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Give your feedback here"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};
