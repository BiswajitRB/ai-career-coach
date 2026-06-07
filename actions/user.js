"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateAIInsights } from "./dashboard";

export async function updateUser(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    // Check if industry already exists
    let industryInsight = await db.industryInsight.findUnique({
      where: {
        industry: data.industry,
      },
    });

    // Generate AI data OUTSIDE transaction
    if (!industryInsight) {
      const insights = await generateAIInsights(data.industry);

      industryInsight = await db.industryInsight.create({
        data: {
          industry: data.industry,
          ...insights,
          nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
    }

    // Update user separately
    const updatedUser = await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        industry: data.industry,
        experience: data.experience,
        bio: data.bio,
        skills: data.skills,
      },
    });

    revalidatePath("/");

    return {
      updatedUser,
      industryInsight,
    };
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error("Failed to update profile");
  }
}
export async function getUserOnboardingStatus() {
  const { userId } = await auth();

  if (!userId) {
    return {
      isOnboarded: false,
    };
  }

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
    select: {
      industry: true,
    },
  });

  return {
    isOnboarded: !!user?.industry,
  };
}