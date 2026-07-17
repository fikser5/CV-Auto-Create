import "server-only";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 godzina

function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

// Returns the raw token (goes in the email link) — only its hash is stored,
// so a database leak alone can't be used to reset anyone's password.
export async function createPasswordResetToken(userId: string): Promise<string> {
  const rawToken = crypto.randomBytes(32).toString("hex");

  await prisma.passwordResetToken.create({
    data: {
      userId,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });

  return rawToken;
}

export async function verifyPasswordResetToken(rawToken: string): Promise<{ userId: string } | null> {
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(rawToken) },
  });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return null;
  }

  return { userId: record.userId };
}

export async function consumePasswordResetToken(rawToken: string): Promise<{ userId: string } | null> {
  const verified = await verifyPasswordResetToken(rawToken);
  if (!verified) return null;

  await prisma.passwordResetToken.update({
    where: { tokenHash: hashToken(rawToken) },
    data: { usedAt: new Date() },
  });

  return verified;
}
