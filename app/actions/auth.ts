"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  RegisterFormSchema,
  type RegisterFormState,
  ForgotPasswordSchema,
  type ForgotPasswordState,
  ResetPasswordSchema,
  type ResetPasswordState,
} from "@/lib/definitions";
import { sendWelcomeEmail, sendPasswordResetEmail } from "@/lib/email";
import { createPasswordResetToken, consumePasswordResetToken } from "@/lib/password-reset";

async function getBaseUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const isLocalNetwork = /^localhost(:\d+)?$/.test(host) || /^(\d{1,3}\.){3}\d{1,3}(:\d+)?$/.test(host);
  const proto = h.get("x-forwarded-proto") ?? (isLocalNetwork ? "http" : "https");
  return `${proto}://${host}`;
}

export async function registerUser(
  _state: RegisterFormState,
  formData: FormData,
): Promise<RegisterFormState> {
  const validatedFields = RegisterFormSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { fullName, email, password } = validatedFields.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { message: "Konto z tym adresem e-mail już istnieje." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: { fullName, email, passwordHash },
  });

  // Never block registration on email delivery — sendWelcomeEmail swallows its own errors.
  await sendWelcomeEmail(email, fullName);

  await signIn("credentials", {
    email,
    password,
    redirectTo: "/dashboard",
  });
}

export type LoginFormState = { message?: string } | undefined;

export async function loginUser(
  _state: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { message: "Nieprawidłowy e-mail lub hasło." };
    }
    throw error;
  }
}

export async function logoutUser() {
  await signOut({ redirectTo: "/" });
}

export async function requestPasswordReset(
  _state: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const validatedFields = ForgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!validatedFields.success) {
    return { message: "Podaj poprawny adres e-mail." };
  }

  const { email } = validatedFields.data;
  const user = await prisma.user.findUnique({ where: { email } });

  // Always return the same generic outcome regardless of whether the account
  // exists — otherwise this endpoint could be used to check which emails are
  // registered.
  if (user) {
    try {
      const token = await createPasswordResetToken(user.id);
      const baseUrl = await getBaseUrl();
      const resetUrl = `${baseUrl}/reset-password?token=${token}`;
      await sendPasswordResetEmail(user.email, user.fullName, resetUrl);
    } catch (error) {
      console.error("Nie udało się wysłać e-maila resetującego hasło:", error);
      return { message: "Nie udało się wysłać e-maila. Spróbuj ponownie później." };
    }
  }

  return { sent: true };
}

export async function resetPassword(
  _state: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const validatedFields = ResetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
  });
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { token, password } = validatedFields.data;
  const verified = await consumePasswordResetToken(token);
  if (!verified) {
    return { message: "Link do resetu hasła jest nieprawidłowy lub wygasł. Poproś o nowy." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { id: verified.userId }, data: { passwordHash } });

  redirect("/login?reset=success");
}
