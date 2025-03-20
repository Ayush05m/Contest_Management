import { notFound } from "next/navigation"
import ContestForm from "@/components/contest-form"
import { getContestById } from "@/lib/actions/contest-actions"

export default async function EditContestPage({ params }: { params: { id: string } }) {
  const contest = await getContestById(params.id)

  if (!contest || !contest.canEdit) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Edit Contest</h1>
        <ContestForm contest={contest} />
      </div>
    </div>
  )
}

