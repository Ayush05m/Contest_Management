"use server";

import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { jwtDecode } from "jwt-decode";
import { hash, compare } from "bcrypt";
import clientPromise from "@/lib/db";

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

// Update user profile
export async function updateProfile({
  name,
  currentPassword,
  newPassword,
}: {
  name: string;
  currentPassword?: string;
  newPassword?: string;
}): Promise<void> {
  const client = await clientPromise;
  const db = client.db();
  const userId = await getCurrentUser();

  if (!userId) {
    throw new Error(
      "Authentication required. Please log in to update your profile."
    );
  }

  try {
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });

    if (!user) {
      throw new Error("User not found.");
    }

    const updateData: any = { name };

    // If changing password
    if (newPassword && currentPassword) {
      // Verify current password
      const isPasswordValid = await compare(currentPassword, user.password);

      if (!isPasswordValid) {
        throw new Error("Current password is incorrect.");
      }

      // Hash new password
      const hashedPassword = await hash(newPassword, 10);
      updateData.password = hashedPassword;
    }

    // Update user
    const result = await db
      .collection("users")
      .updateOne({ _id: new ObjectId(userId) }, { $set: updateData });

    if (result.matchedCount === 0) {
      throw new Error("Failed to update profile. User not found.");
    }

    if (result.modifiedCount === 0 && Object.keys(updateData).length > 0) {
      throw new Error("No changes were made to your profile.");
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to update profile. Please try again.");
  }
}
