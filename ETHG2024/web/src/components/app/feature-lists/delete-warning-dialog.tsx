import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import {
  AlertDialogAction,
  AlertDialogCancel,
} from "@radix-ui/react-alert-dialog";
import { Button } from "../../ui/button";

export const DeleteWarningDialog = ({
  deleteCallback,
  title = "Are you absolutely sure?",
  description,
  className,
}: {
  deleteCallback: () => void;
  title?: string;
  description: string;
  className?: string;
}) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild className={className}>
        <button className="block cursor-pointer rounded-sm">
          <Trash2 className="h-4 w-4" />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="secondary">Cancel</Button>
          </AlertDialogCancel>
          <AlertDialogAction
            asChild
            onClick={(e) => {
              e.preventDefault();
              //deleteCallback closes the dialog because it makes the parent component rerender - TODO - maybe investigate to make it better
              deleteCallback();
            }}
          >
            <Button variant="destructive">Delete</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
