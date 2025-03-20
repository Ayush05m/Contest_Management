import ContestForm from "@/components/contest-form"

export default function NewContestPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Add New Contest</h1>
        <ContestForm />
      </div>
    </div>
  )
}

