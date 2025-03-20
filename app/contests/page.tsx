import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import ContestList from "@/components/contest-list"
import ContestFilters from "@/components/contest-filters"
import { getContests } from "@/lib/actions/contest-actions"
import { Skeleton } from "@/components/ui/skeleton"

export default async function ContestsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const params = await searchParams;
  const platform = params.platform as string | undefined
  const category = params.category as string | undefined
  const status = params.status as string | undefined
  const page = Number(params.page) || 1

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Contests</h1>
          <p className="text-muted-foreground">Browse and discover programming contests from various platforms</p>
        </div>
        <Button asChild>
          <Link href="/contests/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Contest
          </Link>
        </Button>
      </div>

      <ContestFilters />

      <Suspense fallback={<ContestListSkeleton />}>
        <ContestListWrapper platform={platform} category={category} status={status} page={page} />
      </Suspense>
    </div>
  )
}

async function ContestListWrapper({
  platform,
  category,
  status,
  page,
}: {
  platform?: string
  category?: string
  status?: string
  page: number
}) {
  const { contests, totalPages } = await getContests({ platform, category, status, page })

  return (
    <>
      <ContestList contests={contests} />

      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex gap-2">
            {page > 1 && (
              <Button variant="outline" asChild>
                <Link href={{ query: { ...Object.fromEntries(new URLSearchParams()), page: page - 1 } }}>Previous</Link>
              </Button>
            )}
            {page < totalPages && (
              <Button variant="outline" asChild>
                <Link href={{ query: { ...Object.fromEntries(new URLSearchParams()), page: page + 1 } }}>Next</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  )
}

function ContestListSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
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

