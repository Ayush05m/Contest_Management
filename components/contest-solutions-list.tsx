"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ExternalLink, Trash2 } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { deleteSolution } from "@/lib/actions/solution-actions";
import type { SolutionWithUser } from "@/lib/types";
import { ConfirmDialog } from "./confirm-dialog";

export default function ContestSolutionsList({
  solutions,
  contestId,
  totalPages,
  currentPage,
}: {
  solutions: SolutionWithUser[];
  contestId: string;
  totalPages: number;
  currentPage: number;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [deletingSolutionId, setDeletingSolutionId] = useState<string | null>(
    null
  );

  const handleDelete = async (solutionId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this solution? This action cannot be undone."
      )
    ) {
      return;
    }

    setDeletingSolutionId(solutionId);
    try {
      await deleteSolution(contestId);
      toast({
        title: "Solution deleted",
        description: "Your solution has been deleted successfully",
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to delete solution. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingSolutionId(null);
    }
  };

  if (solutions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          No solutions have been submitted for this contest yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {solutions.map((solution) => (
          <Card key={solution._id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {solution.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">
                      {solution.user.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Submitted {formatRelativeTime(solution.createdAt)}
                      {solution.createdAt !== solution.updatedAt &&
                        " (updated)"}
                    </p>
                  </div>
                </div>
                {solution.isOwner && (
                  <ConfirmDialog
                    title="Delete Solution"
                    description="Are you sure you want to delete this solution? This action cannot be undone."
                    confirmText="Delete"
                    variant="destructive"
                    onConfirm={async () => {
                      try {
                        await deleteSolution(contestId);
                        toast({
                          title: "Solution deleted",
                          description:
                            "Your solution has been deleted successfully",
                        });
                        router.refresh();
                      } catch (error) {
                        toast({
                          title: "Error",
                          description:
                            error instanceof Error
                              ? error.message
                              : "Failed to delete solution. Please try again.",
                          variant: "destructive",
                        });
                        throw error;
                      }
                    }}
                    trigger={
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    }
                  />
                )}
              </div>
            </CardHeader>
            <CardContent>
              {solution.notes && (
                <p className="text-sm mb-4">{solution.notes}</p>
              )}
              <div className="flex items-center gap-2 text-sm">
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                <a
                  href={solution.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all"
                >
                  {solution.link}
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Button variant="outline" asChild>
                <Link
                  href={`/contests/${contestId}?solutionsPage=${
                    currentPage - 1
                  }`}
                >
                  Previous
                </Link>
              </Button>
            )}
            {currentPage < totalPages && (
              <Button variant="outline" asChild>
                <Link
                  href={`/contests/${contestId}?solutionsPage=${
                    currentPage + 1
                  }`}
                >
                  Next
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
