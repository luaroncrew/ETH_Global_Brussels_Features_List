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

const allowUserFormSchema = z.object({
  email: z.string().email({
    message: "Title should be a valid email.",
  }),
});

export const AllowUserDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const addAllowedUserMutation = api.company.addAllowedUser.useMutation();

  const form = useForm<z.infer<typeof allowUserFormSchema>>({
    resolver: zodResolver(allowUserFormSchema),
    defaultValues: {
      email: "",
    },
  });

  const apiUtils = api.useUtils();
  function createFeatureSuggestion(
    values: z.infer<typeof allowUserFormSchema>,
  ) {
    addAllowedUserMutation.mutate(
      { ...values },
      {
        onSuccess: () => {
          apiUtils.company.getById.invalidate().catch(console.error);
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
          <Plus className="mr-1 h-4 w-4" /> User
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="john.doe@acme.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="self-end">
              Allow User
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
