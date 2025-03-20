"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useAppSelector } from "@/lib/redux/store"
import { saveSolution, deleteSolution } from "@/lib/actions/solution-actions"
import type { Solution } from "@/lib/types"
import { ExternalLink, Trash2 } from "lucide-react"
import { ConfirmDialog } from "@/components/confirm-dialog"

// Import the LoadingButton
import { LoadingButton } from "@/components/ui/loading-button"

export default function SolutionForm({
  contestId,
  existingSolution,
}: {
  contestId: string
  existingSolution?: Solution | null
}) {
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  const { toast } = useToast()
  const router = useRouter()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [solution, setSolution] = useState({
    link: existingSolution?.link || "",
    notes: existingSolution?.notes || "",
  })

  if (!isAuthenticated) {
    return (
      <div className="bg-card rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">Your Solution</h2>
        <p className="text-muted-foreground mb-4">Please log in to add your solution for this contest.</p>
        <Button asChild>
          <a href={`/auth/login?callbackUrl=/contests/${contestId}`}>Log in</a>
        </Button>
      </div>
    )
  }

  // Update the handleSubmit function with better error handling and UX
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!solution.link) {
      toast({
        title: "Missing information",
        description: "Please provide a solution link",
        variant: "destructive",
      })
      return
    }

    // Validate URL
    try {
      new URL(solution.link)
    } catch (e) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL starting with http:// or https://",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      await saveSolution(contestId, solution.link, solution.notes)
      toast({
        title: existingSolution ? "Solution updated" : "Solution saved",
        description: existingSolution
          ? "Your solution has been updated successfully"
          : "Your solution has been saved successfully",
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save solution. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update the handleDelete function with confirmation
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete your solution? This action cannot be undone.")) {
      return
    }

    setIsDeleting(true)
    try {
      await deleteSolution(contestId)
      toast({
        title: "Solution deleted",
        description: "Your solution has been deleted successfully",
      })
      setSolution({ link: "", notes: "" })
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete solution. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="bg-card rounded-lg border p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Your Solution</h2>
        {existingSolution && (
          <ConfirmDialog
            title="Delete Solution"
            description="Are you sure you want to delete your solution? This action cannot be undone."
            confirmText="Delete"
            variant="destructive"
            onConfirm={async () => {
              try {
                await deleteSolution(contestId)
                toast({
                  title: "Solution deleted",
                  description: "Your solution has been deleted successfully",
                })
                setSolution({ link: "", notes: "" })
                router.refresh()
              } catch (error) {
                toast({
                  title: "Error",
                  description: error instanceof Error ? error.message : "Failed to delete solution. Please try again.",
                  variant: "destructive",
                })
                throw error
              }
            }}
            trigger={
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Solution
              </Button>
            }
          />
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="solution-link">Solution Link</Label>
          <Input
            id="solution-link"
            type="url"
            placeholder="https://github.com/yourusername/solution"
            value={solution.link}
            onChange={(e) => setSolution({ ...solution, link: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="solution-notes">Notes (Optional)</Label>
          <Textarea
            id="solution-notes"
            placeholder="Add any notes about your solution approach..."
            value={solution.notes}
            onChange={(e) => setSolution({ ...solution, notes: e.target.value })}
            rows={4}
          />
        </div>

        <div className="flex justify-end">
          {/* Replace the submit button with LoadingButton */}
          <LoadingButton
            type="submit"
            isLoading={isSubmitting}
            loadingText={existingSolution ? "Updating..." : "Saving..."}
          >
            {existingSolution ? "Update Solution" : "Save Solution"}
          </LoadingButton>
        </div>
      </form>

      {existingSolution && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
            <a
              href={existingSolution.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline break-all"
            >
              {existingSolution.link}
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

