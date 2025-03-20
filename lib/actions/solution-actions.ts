"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { jwtDecode } from "jwt-decode";
import clientPromise from "@/lib/db";
import { getContestStatus } from "@/lib/utils";
import type { Solution, SolutionWithUser } from "@/lib/types";

// Get current user from token
const getCurrentUser = async () => {
  // Try to get token from both possible cookie names
  const authToken = (await cookies()).get("AUTH_TOKEN")?.value;
  const token = (await cookies()).get("token")?.value;

  const activeToken = authToken || token;

  if (!activeToken) return null;

  try {
    const decoded = jwtDecode<{ id: string }>(activeToken);
    return decoded.id;
  } catch (error) {
    return null;
  }
};

// Save or update solution
export async function saveSolution(
  contestId: string,
  link: string,
  notes?: string
): Promise<void> {
  const client = await clientPromise;
  const db = client.db();
  const userId = await getCurrentUser();

  if (!userId) {
    throw new Error(
      "Authentication required. Please log in to save your solution."
    );
  }

  try {
    try {
      new URL(link);
    } catch (e) {
      throw new Error(
        "Please enter a valid URL starting with http:// or https://"
      );
    }
    const solution = await db.collection("solutions").findOne({
      user: new ObjectId(userId),
      contest: new ObjectId(contestId),
    });

    if (solution) {
      // Update solution
      await db.collection("solutions").updateOne(
        { _id: solution._id },
        {
          $set: {
            link,
            notes,
            updatedAt: new Date(),
          },
        }
      );
    } else {
      // Create solution
      await db.collection("solutions").insertOne({
        user: new ObjectId(userId),
        contest: new ObjectId(contestId),
        link,
        notes,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    revalidatePath(`/contests/${contestId}`);
    revalidatePath("/solutions");
  } catch (error) {
    console.error("Error saving solution:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to save solution. Please try again.");
  }
}

// Delete solution
export async function deleteSolution(contestId: string): Promise<void> {
  const client = await clientPromise;
  const db = client.db();
  const userId = await getCurrentUser();

  if (!userId) {
    throw new Error(
      "Authentication required. Please log in to delete your solution."
    );
  }

  try {
    const result = await db.collection("solutions").deleteOne({
      user: new ObjectId(userId),
      contest: new ObjectId(contestId),
    });

    if (result.deletedCount === 0) {
      throw new Error(
        "Solution not found or you don't have permission to delete it."
      );
    }

    revalidatePath(`/contests/${contestId}`);
    revalidatePath("/solutions");
  } catch (error) {
    console.error("Error deleting solution:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to delete solution. Please try again.");
  }
}

// Get user solutions
export async function getUserSolutions(): Promise<Solution[]> {
  const client = await clientPromise;
  const db = client.db();
  const userId = await getCurrentUser();

  if (!userId) {
    return [];
  }

  try {
    const solutions = await db
      .collection("solutions")
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
          $sort: { updatedAt: -1 },
        },
      ])
      .toArray();

    return solutions.map((solution) => ({
      _id: solution._id.toString(),
      user: solution.user.toString(),
      contest: {
        _id: solution.contestDetails._id.toString(),
        title: solution.contestDetails.title,
        platform: solution.contestDetails.platform,
        category: solution.contestDetails.category,
        startDate: solution.contestDetails.startDate,
        endDate: solution.contestDetails.endDate,
        duration: (
          solution.contestDetails.endDate - solution.contestDetails.startDate
        ).toString(),
        status: getContestStatus(
          solution.contestDetails.startDate,
          solution.contestDetails.endDate
        ),
      },
      link: solution.link,
      notes: solution.notes,
      createdAt: solution.createdAt,
      updatedAt: solution.updatedAt,
    }));
  } catch (error) {
    console.error("Error fetching solutions:", error);
    return [];
  }
}

export async function getContestSolutions(
  contestId: string,
  page = 1,
  limit = 10
): Promise<{ solutions: SolutionWithUser[]; totalPages: number }> {
  const client = await clientPromise;
  const db = client.db();
  const userId = await getCurrentUser();

  try {
    // Get total count for pagination
    const total = await db.collection("solutions").countDocuments({
      contest: new ObjectId(contestId),
    });

    const totalPages = Math.ceil(total / limit);

    const solutions = await db
      .collection("solutions")
      .aggregate([
        {
          $match: { contest: new ObjectId(contestId) },
        },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $unwind: "$userDetails",
        },
        {
          $sort: { updatedAt: -1 },
        },
        {
          $skip: (page - 1) * limit,
        },
        {
          $limit: limit,
        },
      ])
      .toArray();

    return {
      solutions: solutions.map((solution) => ({
        _id: solution._id.toString(),
        user: {
          _id: solution.user.toString(),
          name: solution.userDetails.name,
          email: solution.userDetails.email,
        },
        contest: solution.contest.toString(),
        link: solution.link,
        notes: solution.notes,
        createdAt: solution.createdAt,
        updatedAt: solution.updatedAt,
        isOwner: userId === solution.user.toString(),
      })),
      totalPages,
    };
  } catch (error) {
    console.error("Error fetching contest solutions:", error);
    return { solutions: [], totalPages: 0 };
  }
}
