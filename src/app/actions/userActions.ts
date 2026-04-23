"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateWeeklyAllowance(userId: string, value: number) {
  await prisma.user.update({
    where: { id: userId },
    data: { weeklyAllowance: value },
  });
  revalidatePath("/dashboard/pais/mensal");
}