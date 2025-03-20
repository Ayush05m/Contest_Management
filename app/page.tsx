import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CalendarDays, Award, Bookmark, ExternalLink } from "lucide-react"
import ContestList from "@/components/contest-list"
import { getUpcomingContests } from "@/lib/actions/contest-actions"

export default async function Home() {
  const contests = await getUpcomingContests()

  return (
    <main className="container mx-auto px-4 py-8">
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Contest Management Platform</h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Track upcoming contests, bookmark your favorites, and manage your solutions all in one place.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/contests">
              <CalendarDays className="mr-2 h-5 w-5" />
              Browse Contests
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/auth/login">Get Started</Link>
          </Button>
        </div>
      </section>

      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Upcoming Contests</h2>
          <Button asChild variant="ghost">
            <Link href="/contests">View All</Link>
          </Button>
        </div>
        <ContestList contests={contests} />
      </section>

      <section className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="bg-card rounded-lg p-6 shadow-sm border">
          <Award className="h-12 w-12 mb-4 text-primary" />
          <h3 className="text-xl font-bold mb-2">Join Contests</h3>
          <p className="text-muted-foreground">
            Discover and participate in coding contests, hackathons, and competitions from various platforms.
          </p>
        </div>
        <div className="bg-card rounded-lg p-6 shadow-sm border">
          <Bookmark className="h-12 w-12 mb-4 text-primary" />
          <h3 className="text-xl font-bold mb-2">Bookmark Favorites</h3>
          <p className="text-muted-foreground">
            Save contests you're interested in and get reminders before they start.
          </p>
        </div>
        <div className="bg-card rounded-lg p-6 shadow-sm border">
          <ExternalLink className="h-12 w-12 mb-4 text-primary" />
          <h3 className="text-xl font-bold mb-2">Track Solutions</h3>
          <p className="text-muted-foreground">
            Store links to your solutions and track your progress across different contests.
          </p>
        </div>
      </section>
    </main>
  )
}

