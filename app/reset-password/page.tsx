import { Suspense } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { ResetPasswordForm } from "@/app/reset-password/ResetPasswordForm";
import { card } from "@/lib/ui";

export default function ResetPasswordPage() {
  return (
    <main className="relative flex flex-1 items-center justify-center px-6 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(ellipse_50%_45%_at_50%_-5%,var(--rose-soft),transparent)]"
      />
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand text-sm font-bold text-primary-foreground">
              C
            </span>
            <span className="font-semibold">CVAutomat</span>
          </Link>
          <ThemeToggle />
        </div>

        <Suspense fallback={<div className={`${card} h-64 animate-pulse`} />}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}
