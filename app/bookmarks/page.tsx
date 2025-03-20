import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import ContestList from "@/components/contest-list"
import { getBookmarkedContests } from "@/lib/actions/bookmark-actions"
import { Skeleton } from "@/components/ui/skeleton"

export default function BookmarksPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Bookmarks</h1>
        <p className="text-muted-foreground">Contests you've saved for later</p>
      </div>

      <Suspense fallback={<BookmarksListSkeleton />}>
        <BookmarksListWrapper />
      </Suspense>
    </div>
  )
}

async function BookmarksListWrapper() {
  const bookmarks = await getBookmarkedContests()

  if (!bookmarks.length) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-muted-foreground">You haven't bookmarked any contests yet.</p>
        <Button asChild>
          <Link href="/contests">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Browse Contests
          </Link>
        </Button>
      </div>
    )
  }

  return <ContestList contests={bookmarks} />
}

function BookmarksListSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="border rounded-lg p-4 space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-24 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  )
}

