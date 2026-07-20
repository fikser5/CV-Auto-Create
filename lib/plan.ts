import "server-only";
import type { Plan } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const PREMIUM_MONTHLY_PRICE_PLN = 29;
export const PACKAGE_PRICE_PLN = 5;
export const PACKAGE_CREDITS = 2;

export type PlanUser = {
  plan: Plan;
  planRenewsAt: Date | null;
  freeGenerationUsed: boolean;
  purchasedCredits: number;
  hasEverPurchased: boolean;
};

export function isPremiumActive(user: PlanUser): boolean {
  return user.plan === "premium" && !!user.planRenewsAt && user.planRenewsAt.getTime() > Date.now();
}

export function canViewHistory(user: PlanUser): boolean {
  return isPremiumActive(user) || user.hasEverPurchased;
}

export type GenerationAllowance =
  | { allowed: true; source: "premium" }
  | { allowed: true; source: "free" }
  | { allowed: true; source: "credits" }
  | { allowed: false };

export function checkGenerationAllowance(user: PlanUser): GenerationAllowance {
  if (isPremiumActive(user)) return { allowed: true, source: "premium" };
  if (!user.freeGenerationUsed) return { allowed: true, source: "free" };
  if (user.purchasedCredits > 0) return { allowed: true, source: "credits" };
  return { allowed: false };
}

// Call once, right after a generation actually succeeds — never before, so a
// failed Claude call doesn't burn the user's free generation or a credit.
export async function consumeGenerationAllowance(userId: string, allowance: GenerationAllowance): Promise<void> {
  if (!allowance.allowed || allowance.source === "premium") return;
  if (allowance.source === "free") {
    await prisma.user.update({ where: { id: userId }, data: { freeGenerationUsed: true } });
  } else {
    await prisma.user.update({ where: { id: userId }, data: { purchasedCredits: { decrement: 1 } } });
  }
}

export type PlanStatus = {
  isPremiumActive: boolean;
  canGenerate: boolean;
  canViewHistory: boolean;
  label: string;
  detail: string;
};

export function describePlanStatus(user: PlanUser): PlanStatus {
  const premiumActive = isPremiumActive(user);
  const allowance = checkGenerationAllowance(user);

  if (premiumActive) {
    const renewsAt = user.planRenewsAt as Date;
    return {
      isPremiumActive: true,
      canGenerate: true,
      canViewHistory: true,
      label: "Premium",
      detail: `Nielimitowane generowanie CV — aktywne do ${renewsAt.toLocaleDateString("pl-PL")}.`,
    };
  }

  if (!user.freeGenerationUsed) {
    return {
      isPremiumActive: false,
      canGenerate: true,
      canViewHistory: canViewHistory(user),
      label: "Plan darmowy",
      detail: "Masz 1 darmowe CV do wygenerowania.",
    };
  }

  if (user.purchasedCredits > 0) {
    return {
      isPremiumActive: false,
      canGenerate: true,
      canViewHistory: true,
      label: "Pakiet",
      detail: `Pozostało ${user.purchasedCredits} ${user.purchasedCredits === 1 ? "wygenerowanie" : "wygenerowania"} CV.`,
    };
  }

  return {
    isPremiumActive: false,
    canGenerate: allowance.allowed,
    canViewHistory: canViewHistory(user),
    label: "Plan darmowy",
    detail: "Wykorzystano darmowe CV. Wykup Premium albo pakiet, żeby generować kolejne.",
  };
}
