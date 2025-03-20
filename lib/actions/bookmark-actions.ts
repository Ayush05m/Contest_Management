"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { ObjectId } from "mongodb"
import { jwtDecode } from "jwt-decode"
import clientPromise from "@/lib/db"
import { getContestStatus } from "@/lib/utils"
import type { Contest } from "@/lib/types"

// Get current user from token
const getCurrentUser = async () => {
  // Try to get token from both possible cookie names
  const cookieStore = await cookies()
  const authToken = cookieStore.get("AUTH_TOKEN")?.value
  const token = cookieStore.get("token")?.value

  const activeToken = authToken || token

  if (!activeToken) return null

  try {
    const decoded = jwtDecode<{ id: string }>(activeToken)
    return decoded.id
  } catch (error) {
    return null
  }
}

// Toggle bookmark status
export async function toggleBookmark(contestId: string): Promise<void> {
  const client = await clientPromise
  const db = client.db()
  const userId = await getCurrentUser()

  if (!userId) {
    throw new Error("Authentication required. Please log in to bookmark contests.")
  }

  try {
    // Check if bookmark exists
    const bookmark = await db.collection("bookmarks").findOne({
      user: new ObjectId(userId),
      contest: new ObjectId(contestId),
    })

    if (bookmark) {
      // Remove bookmark
      const result = await db.collection("bookmarks").deleteOne({
        _id: bookmark._id,
      })

      if (result.deletedCount === 0) {
        throw new Error("Failed to remove bookmark. Please try again.")
      }
    } else {
      // Add bookmark
      const result = await db.collection("bookmarks").insertOne({
        user: new ObjectId(userId),
        contest: new ObjectId(contestId),
        createdAt: new Date(),
      })

      if (!result.insertedId) {
        throw new Error("Failed to add bookmark. Please try again.")
      }
    }

    revalidatePath("/contests")
    revalidatePath(`/contests/${contestId}`)
    revalidatePath("/bookmarks")
  } catch (error) {
    console.error("Error toggling bookmark:", error)
    throw error instanceof Error ? error : new Error("Failed to update bookmark. Please try again.")
  }
}

// Get bookmarked contests
export async function getBookmarkedContests(): Promise<Contest[]> {
  const client = await clientPromise
  const db = client.db()
  const userId = await getCurrentUser()

  if (!userId) {
    return []
  }

  try {
    const bookmarks = await db
      .collection("bookmarks")
      .aggregate([
        {
          $match: { user: new ObjectId(userId) },
        },
        {
          $lookup: {
            from: "contests",
            localField: "contest",
            foreignField: "_id",
            as: "contestDetails",
          },
        },
        {
          $unwind: "$contestDetails",
        },
        {
          $sort: { "contestDetails.startDate": 1 },
        },
      ])
      .toArray()

    return bookmarks.map((bookmark) => {
      const contest = bookmark.contestDetails
      return {
        _id: contest._id.toString(),
        title: contest.title,
        platform: contest.platform,
        category: contest.category,
        description: contest.description,
        rules: contest.rules,
        prizes: contest.prizes,
        website: contest.website,
        startDate: contest.startDate,
        endDate: contest.endDate,
        duration: contest.duration,
        createdBy: contest.createdBy
          ? {
              _id: contest.createdBy._id.toString(),
              name: contest.createdBy.name,
            }
          : undefined,
        createdAt: contest.createdAt,
        updatedAt: contest.updatedAt,
        isBookmarked: true,
        status: getContestStatus(contest.startDate, contest.endDate),
      }
    })
  } catch (error) {
    console.error("Error fetching bookmarks:", error)
    return []
  }
}

