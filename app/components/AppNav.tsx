"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutUser } from "@/app/actions/auth";
import { ThemeToggle } from "@/app/components/ThemeToggle";

const links = [
  { href: "/dashboard", label: "Panel" },
  { href: "/profile", label: "Profil" },
  { href: "/generate", label: "Generuj CV" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur print:hidden">
      <nav className="mx-auto flex max-w-5xl items-center gap-1 px-4 py-3 sm:px-6">
        <Link href="/dashboard" className="mr-2 flex shrink-0 items-center gap-2 sm:mr-4">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            C
          </span>
          <span className="hidden text-sm font-semibold sm:inline">CVAutomat</span>
        </Link>

        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
          {links.map((link) => {
            const active = pathname === link.href || pathname?.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-accent-soft text-accent-soft-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="ml-2 flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <form action={logoutUser}>
            <button
              type="submit"
              className="whitespace-nowrap rounded-full px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:px-3"
            >
              Wyloguj
            </button>
          </form>
        </div>
      </nav>
    </header>
  );
}
