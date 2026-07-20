import "server-only";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";

const TOKEN_TTL_MS = 48 * 60 * 60 * 1000; // 48 godzin — mniej wrażliwe niż reset hasła, dłuższa ważność

function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

// Returns the raw token (goes in the email link) — only its hash is stored.
export async function createEmailVerificationToken(userId: string): Promise<string> {
  const rawToken = crypto.randomBytes(32).toString("hex");

  await prisma.emailVerificationToken.create({
    data: {
      userId,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });

  return rawToken;
}

export async function consumeEmailVerificationToken(rawToken: string): Promise<{ userId: string } | null> {
  const record = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash: hashToken(rawToken) },
  });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return null;
  }

  await prisma.emailVerificationToken.update({
    where: { tokenHash: hashToken(rawToken) },
    data: { usedAt: new Date() },
  });

  return { userId: record.userId };
}
