import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Globe, ArrowLeft, Edit, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatDateTime } from "@/lib/utils";
import { getContestById } from "@/lib/actions/contest-actions";
import BookmarkButton from "@/components/bookmark-button";
import SolutionForm from "@/components/solution-form";
import DeleteContestButton from "@/components/delete-contest-button";
import { getContestSolutions } from "@/lib/actions/solution-actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContestSolutionsList from "@/components/contest-solutions-list";

export default async function ContestDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const solutionsPage = Number(searchParams.solutionsPage) || 1;
  const contest = await getContestById(params.id);

  if (!contest) {
    notFound();
  }

  const { solutions, totalPages } = await getContestSolutions(
    params.id,
    solutionsPage
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/contests"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to contests
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{contest.title}</h1>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{contest.platform}</Badge>
            <Badge variant="secondary">{contest.category}</Badge>
            <Badge
              variant={
                contest.status === "upcoming"
                  ? "outline"
                  : contest.status === "ongoing"
                  ? "default"
                  : "secondary"
              }
            >
              {contest.status.charAt(0).toUpperCase() + contest.status.slice(1)}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <BookmarkButton
            contestId={contest._id}
            isBookmarked={contest.isBookmarked}
          />
          {contest.canEdit && (
            <>
              <Button asChild variant="outline" size="sm">
                <Link href={`/contests/${contest._id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
              <DeleteContestButton id={contest._id} />
            </>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Tabs defaultValue="details">
            <TabsList className="mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="solutions">
                Solutions
                <Badge variant="secondary" className="ml-2">
                  {totalPages > 0 ? solutions.length : 0}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              <div className="bg-card rounded-lg border p-6">
                <h2 className="text-xl font-semibold mb-4">Description</h2>
                <div className="prose dark:prose-invert max-w-none">
                  <p>{contest.description}</p>
                </div>
              </div>

              {contest.rules && (
                <div className="bg-card rounded-lg border p-6">
                  <h2 className="text-xl font-semibold mb-4">Rules</h2>
                  <div className="prose dark:prose-invert max-w-none">
                    <p>{contest.rules}</p>
                  </div>
                </div>
              )}

              {contest.prizes && (
                <div className="bg-card rounded-lg border p-6">
                  <h2 className="text-xl font-semibold mb-4">Prizes</h2>
                  <div className="prose dark:prose-invert max-w-none">
                    <p>{contest.prizes}</p>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="solutions" className="space-y-6">
              <div className="bg-card rounded-lg border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-xl font-semibold">Community Solutions</h2>
                </div>
                <ContestSolutionsList
                  solutions={solutions}
                  contestId={contest._id}
                  totalPages={totalPages}
                  currentPage={solutionsPage}
                />
              </div>
            </TabsContent>
          </Tabs>
          <SolutionForm
            contestId={contest._id}
            existingSolution={contest.userSolution}
          />
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Contest Details</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center text-sm text-muted-foreground mb-1">
                  <Calendar className="mr-2 h-4 w-4" />
                  Start Date
                </div>
                <p>{formatDateTime(contest.startDate)}</p>
              </div>
              <div>
                <div className="flex items-center text-sm text-muted-foreground mb-1">
                  <Calendar className="mr-2 h-4 w-4" />
                  End Date
                </div>
                <p>{formatDateTime(contest.endDate)}</p>
              </div>
              <div>
                <div className="flex items-center text-sm text-muted-foreground mb-1">
                  <Clock className="mr-2 h-4 w-4" />
                  Duration
                </div>
                <p>{contest.duration}</p>
              </div>
              {contest.website && (
                <div>
                  <div className="flex items-center text-sm text-muted-foreground mb-1">
                    <Globe className="mr-2 h-4 w-4" />
                    Website
                  </div>
                  <a
                    href={contest.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline break-all"
                  >
                    {contest.website}
                  </a>
                </div>
              )}
            </div>
          </div>

          {contest.createdBy && (
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-lg font-semibold mb-2">Added By</h2>
              <p>{contest.createdBy.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(contest.createdAt || "")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
