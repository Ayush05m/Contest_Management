"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { jwtDecode } from "jwt-decode";
import clientPromise from "@/lib/db";
import { getContestStatus } from "@/lib/utils";
import type { Contest, Solution } from "@/lib/types";

// Get current user from token
const getCurrentUser = async () => {
  // Try to get token from both possible cookie names
  const cookieStore = await cookies();
  const authToken = cookieStore.get("AUTH_TOKEN")?.value;
  const token = cookieStore.get("token")?.value;

  const activeToken = authToken || token;

  if (!activeToken) return null;

  try {
    const decoded = jwtDecode<{ id: string }>(activeToken);
    return decoded.id;
  } catch (error) {
    return null;
  }
};

// Get upcoming contests for homepage
export async function getUpcomingContests(limit = 6): Promise<Contest[]> {
  const client = await clientPromise;
  const db = client.db();
  const userId = await getCurrentUser();

  const now = new Date();

  const contests = await db
    .collection("contests")
    .find({ startDate: { $gt: now } })
    .sort({ startDate: 1 })
    .limit(limit)
    .toArray();

  // Check if contests are bookmarked by current user
  let bookmarks: Record<string, boolean> = {};

  if (userId) {
    const userBookmarks = await db
      .collection("bookmarks")
      .find({ user: new ObjectId(userId) })
      .toArray();

    bookmarks = userBookmarks.reduce((acc, bookmark) => {
      acc[bookmark.contest.toString()] = true;
      return acc;
    }, {} as Record<string, boolean>);
  }

  return contests.map((contest) => {
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
      isBookmarked: bookmarks[contest._id.toString()] || false,
      status: getContestStatus(contest.startDate, contest.endDate),
    };
  });
}

// Get contests with filters and pagination
export async function getContests({
  platform,
  category,
  status,
  page = 1,
  limit = 9,
}: {
  platform?: string;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ contests: Contest[]; totalPages: number }> {
  const client = await clientPromise;
  const db = client.db();
  const userId = await getCurrentUser();

  const query: any = {};
  const now = new Date();

  if (platform && platform !== "all") {
    query.platform = platform;
  }

  if (category && category !== "all") {
    query.category = category;
  }

  if (status && status !== "all") {
    if (status === "upcoming") {
      query.startDate = { $gt: now };
    } else if (status === "ongoing") {
      query.startDate = { $lte: now };
      query.endDate = { $gte: now };
    } else if (status === "completed") {
      query.endDate = { $lt: now };
    }
  }

  // Get total count for pagination
  const total = await db.collection("contests").countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  // Get contests with pagination
  const contests = await db
    .collection("contests")
    .find(query)
    .sort({ startDate: 1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .toArray();

  // Check if contests are bookmarked by current user
  let bookmarks: Record<string, boolean> = {};

  if (userId) {
    const userBookmarks = await db
      .collection("bookmarks")
      .find({ user: new ObjectId(userId) })
      .toArray();

    bookmarks = userBookmarks.reduce((acc, bookmark) => {
      acc[bookmark.contest.toString()] = true;
      return acc;
    }, {} as Record<string, boolean>);
  }

  return {
    contests: contests.map((contest) => {
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
        isBookmarked: bookmarks[contest._id.toString()] || false,
        status: getContestStatus(contest.startDate, contest.endDate),
      };
    }),
    totalPages,
  };
}

// Get contest by ID
export async function getContestById(id: string): Promise<Contest | null> {
  const client = await clientPromise;
  const db = client.db();
  const userId = await getCurrentUser();

  try {
    const contest = await db
      .collection("contests")
      .findOne({ _id: new ObjectId(id) });

    if (!contest) return null;

    // Check if contest is bookmarked by current user
    let isBookmarked = false;
    let userSolution = null;
    let canEdit = false;

    if (userId) {
      // Check bookmark
      const bookmark = await db
        .collection("bookmarks")
        .findOne({ user: new ObjectId(userId), contest: new ObjectId(id) });

      isBookmarked = !!bookmark;

      // Check solution
      const solution = await db
        .collection("solutions")
        .findOne({ user: new ObjectId(userId), contest: new ObjectId(id) });

      if (solution) {
        userSolution = {
          _id: solution._id.toString(),
          user: solution.user.toString(),
          contest: {
            _id: id,
            title: contest.title,
            platform: contest.platform,
            category: contest.category,
            startDate: contest.startDate,
            endDate: contest.endDate,
            status: getContestStatus(contest.startDate, contest.endDate),
          },
          link: solution.link,
          notes: solution.notes,
          createdAt: solution.createdAt,
          updatedAt: solution.updatedAt,
        };
      }

      // Check if user can edit (creator or admin)
      canEdit = userId === contest.createdBy?._id.toString();
    }
    let duration = contest.duration;
    if (!duration) {
      const start = new Date(contest.startDate);
      const end = new Date(contest.endDate);
      const diffMs = end.getTime() - start.getTime();

      // Format duration
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(
        (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );

      if (diffDays > 0) {
        duration = `${diffDays} day${diffDays > 1 ? "s" : ""}`;
        if (diffHours > 0) {
          duration += ` ${diffHours} hour${diffHours > 1 ? "s" : ""}`;
        }
      } else {
        duration = `${diffHours} hour${diffHours > 1 ? "s" : ""}`;
      }
    }
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
      duration: duration,
      createdBy: contest.createdBy
        ? {
            _id: contest.createdBy._id.toString(),
            name: contest.createdBy.name,
          }
        : undefined,
      createdAt: contest.createdAt,
      updatedAt: contest.updatedAt,
      isBookmarked,
      userSolution: (userSolution || undefined) as Solution | null | undefined,
      canEdit,
      status: getContestStatus(contest.startDate, contest.endDate),
    };
  } catch (error) {
    console.error("Error fetching contest:", error);
    return null;
  }
}

// Create a new contest
export async function createContest(contestData: any): Promise<string> {
  const client = await clientPromise;
  const db = client.db();
  const userId = await getCurrentUser();

  if (!userId) {
    throw new Error("Authentication required");
  }

  try {
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });

    if (!user) {
      throw new Error("User not found");
    }

    const result = await db.collection("contests").insertOne({
      ...contestData,
      createdBy: {
        _id: new ObjectId(userId),
        name: user.name,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    revalidatePath("/contests");
    return result.insertedId.toString();
  } catch (error) {
    console.error("Error creating contest:", error);
    throw new Error("Failed to create contest");
  }
}

// Update a contest
export async function updateContest(
  id: string,
  contestData: any
): Promise<void> {
  const client = await clientPromise;
  const db = client.db();
  const userId = await getCurrentUser();

  if (!userId) {
    throw new Error("Authentication required");
  }

  try {
    const contest = await db
      .collection("contests")
      .findOne({ _id: new ObjectId(id) });

    if (!contest) {
      throw new Error("Contest not found");
    }

    // Check if user is the creator
    if (contest.createdBy._id.toString() !== userId) {
      throw new Error("Not authorized to update this contest");
    }

    await db.collection("contests").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...contestData,
          updatedAt: new Date(),
        },
      }
    );

    revalidatePath(`/contests/${id}`);
    revalidatePath("/contests");
  } catch (error) {
    console.error("Error updating contest:", error);
    throw new Error("Failed to update contest");
  }
}

// Delete a contest
export async function deleteContest(id: string): Promise<void> {
  const client = await clientPromise;
  const db = client.db();
  const userId = await getCurrentUser();

  if (!userId) {
    throw new Error(
      "Authentication required. Please log in to delete contests."
    );
  }

  try {
    const contest = await db
      .collection("contests")
      .findOne({ _id: new ObjectId(id) });

    if (!contest) {
      throw new Error("Contest not found.");
    }

    // Check if user is the creator
    if (contest.createdBy._id.toString() !== userId) {
      throw new Error(
        "Not authorized to delete this contest. You must be the creator."
      );
    }

    // Delete the contest
    const deleteResult = await db
      .collection("contests")
      .deleteOne({ _id: new ObjectId(id) });

    if (deleteResult.deletedCount === 0) {
      throw new Error("Failed to delete contest. Please try again.");
    }
    // Delete related bookmarks and solutions
    await db.collection("bookmarks").deleteMany({ contest: new ObjectId(id) });
    await db.collection("solutions").deleteMany({ contest: new ObjectId(id) });

    revalidatePath("/contests");
  } catch (error) {
    console.error("Error deleting contest:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to delete contest. Please try again.");
  }
}
