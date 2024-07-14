import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { api } from "~/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { useState } from "react";
import { Plus } from "lucide-react";

const createFeatureFormSchema = z.object({
  title: z.string().min(1, {
    message: "Title can not be empty.",
  }),
  description: z.string(),
});

export const CreateFeatureDialog = ({
  featureListId,
}: {
  featureListId: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const createFeatureMutation = api.feature.create.useMutation();

  const form = useForm<z.infer<typeof createFeatureFormSchema>>({
    resolver: zodResolver(createFeatureFormSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const apiUtils = api.useUtils();
  function createFeatureSuggestion(
    values: z.infer<typeof createFeatureFormSchema>,
  ) {
    createFeatureMutation.mutate(
      { ...values, featureListId },
      {
        onSuccess: () => {
          apiUtils.feature.getByFeatureList
            .invalidate({ featureListId })
            .catch(console.error);
        },
      },
    );
    form.reset();
    setIsOpen(false);
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        setIsOpen(!isOpen);
      }}
    >
      <DialogTrigger
        onClick={() => {
          setIsOpen(true);
        }}
        asChild
      >
        <Button variant="outline">
          <Plus className="mr-1 h-4 w-4" /> Suggestion
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>New Feature suggestion</DialogTitle>
          <DialogDescription>
            Describe the feature you&apos;d like to see implemented on our
            platform.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(createFeatureSuggestion)}
            className="flex flex-col space-y-8"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Add Dark Theme" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="self-end">
              Add suggestion
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
