import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
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

const createFeatureListFormSchema = z.object({
  name: z.string().min(1, {
    message: "Name can not be empty.",
  }),
  description: z.string(),
});

export const CreateFeatureListDialog = ({
  companyId,
  className,
}: {
  companyId: string;
  className?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const createFeatureListMutation = api.featureList.create.useMutation();

  const form = useForm<z.infer<typeof createFeatureListFormSchema>>({
    resolver: zodResolver(createFeatureListFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const apiUtils = api.useUtils();
  function createFeatureSuggestion(
    values: z.infer<typeof createFeatureListFormSchema>,
  ) {
    createFeatureListMutation.mutate(
      { ...values, companyId },
      {
        onSuccess: () => {
          apiUtils.featureList.getByCompany
            .invalidate({ companyId })
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
        <Button variant="outline" className={`h-8 justify-start ${className}`}>
          <Plus className="mr-2 h-4 w-4" /> Create list
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>New Feature List</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(createFeatureSuggestion)}
            className="flex flex-col space-y-8"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Integration" {...field} />
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
              Create feature list
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
