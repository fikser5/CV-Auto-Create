import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border px-6 py-5 print:hidden">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
        <span>© 2026 CVAutomat</span>
        <div className="flex items-center gap-4">
          <Link href="/terms" className="hover:text-foreground">
            Regulamin
          </Link>
          <Link href="/privacy" className="hover:text-foreground">
            Polityka Prywatności
          </Link>
        </div>
      </div>
    </footer>
  );
}
