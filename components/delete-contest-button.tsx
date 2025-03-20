"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { deleteContest } from "@/lib/actions/contest-actions";
import { ConfirmDialog } from "./confirm-dialog";

export default function DeleteContestButton({ id }: { id: string }) {
  const router = useRouter();
  const { toast } = useToast();

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this contest? This action cannot be undone."
      )
    ) {
      return;
    }
    try {
      await deleteContest(id);
      toast({
        title: "Contest deleted",
        description: "The contest has been deleted successfully",
      });
      router.push("/contests");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to delete contest. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <ConfirmDialog
      title="Delete Contest"
      description="Are you sure you want to delete this contest? This action cannot be undone and will remove all associated bookmarks and solutions."
      confirmText="Delete"
      variant="destructive"
      onConfirm={handleDelete}
      trigger={
        <Button variant="destructive" size="sm">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      }
    />
  );
}
