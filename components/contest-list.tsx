import Link from "next/link"
import { formatDate } from "@/lib/utils"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Globe, Clock } from "lucide-react"
import type { Contest } from "@/lib/types"
import BookmarkButton from "@/components/bookmark-button"

export default function ContestList({ contests }: { contests: Contest[] }) {
  if (!contests.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No contests found.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {contests.map((contest) => (
        <Card key={contest._id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <CardTitle className="line-clamp-2 text-lg">
                <Link href={`/contests/${contest._id}`} className="hover:underline">
                  {contest.title}
                </Link>
              </CardTitle>
              <BookmarkButton contestId={contest._id} isBookmarked={contest.isBookmarked} />
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline">{contest.platform}</Badge>
              <Badge variant="secondary">{contest.category}</Badge>
            </div>
          </CardHeader>
          <CardContent className="pb-3">
            <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{contest.description}</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>
                  {formatDate(contest.startDate)} - {formatDate(contest.endDate)}
                </span>
              </div>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{contest.duration}</span>
              </div>
              {contest.website && (
                <div className="flex items-center">
                  <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                  <a
                    href={contest.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline truncate"
                  >
                    {contest.website.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Link href={`/contests/${contest._id}`} className="text-sm font-medium text-primary hover:underline">
              View Details
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

