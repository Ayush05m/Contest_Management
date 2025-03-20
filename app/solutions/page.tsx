import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink, Calendar } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getUserSolutions } from "@/lib/actions/solution-actions"
import { formatDate } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

export default function SolutionsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Solutions</h1>
        <p className="text-muted-foreground">Track your contest solutions in one place</p>
      </div>

      <Suspense fallback={<SolutionsListSkeleton />}>
        <SolutionsListWrapper />
      </Suspense>
    </div>
  )
}

async function SolutionsListWrapper() {
  const solutions = await getUserSolutions()

  if (!solutions.length) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-muted-foreground">You haven't added any solutions yet.</p>
        <Button asChild>
          <Link href="/contests">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Browse Contests
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {solutions.map((solution) => (
        <Card key={solution._id}>
          <CardHeader className="pb-3">
            <CardTitle>
              <Link href={`/contests/${solution.contest._id}`}></Link>
            </CardTitle>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline">{solution.contest.platform}</Badge>
              <Badge variant="secondary">{solution.contest.category}</Badge>
            </div>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="space-y-2">
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{formatDate(solution.contest.startDate)}</span>
              </div>
              {solution.notes && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground line-clamp-3">{solution.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link
              href={`/contests/${solution.contest._id}`}
              className="text-sm font-medium text-primary hover:underline"
            >
              View Contest
            </Link>
            <a
              href={solution.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-sm font-medium text-primary hover:underline"
            >
              Solution <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

function SolutionsListSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="border rounded-lg p-4 space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="space-y-2 mt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="flex justify-between pt-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      ))}
    </div>
  )
}

