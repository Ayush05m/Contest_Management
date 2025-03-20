"use client";

import { useState } from "react";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAppSelector } from "@/lib/redux/store";
import { toggleBookmark } from "@/lib/actions/bookmark-actions";

export default function BookmarkButton({
  contestId,
  isBookmarked = false,
}: {
  contestId: string;
  isBookmarked?: boolean;
}) {
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { toast } = useToast();

  const handleToggleBookmark = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to bookmark contests",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await toggleBookmark(contestId);
      setBookmarked(!bookmarked);
      toast({
        title: bookmarked ? "Bookmark removed" : "Contest bookmarked",
        description: bookmarked
          ? "The contest has been removed from your bookmarks"
          : "The contest has been added to your bookmarks",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update bookmark. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggleBookmark}
      disabled={isLoading}
      className="h-8 w-8"
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : bookmarked ? (
        <BookmarkCheck className="h-5 w-5 text-primary" />
      ) : (
        <Bookmark className="h-5 w-5" />
      )}
      <span className="sr-only">
        {bookmarked ? "Remove bookmark" : "Add bookmark"}
      </span>
    </Button>
  );
}
