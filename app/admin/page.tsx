import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { AppNav } from "@/app/components/AppNav";
import { AdminCharts } from "@/app/admin/AdminCharts";
import { AdminUserTable } from "@/app/admin/AdminUserTable";
import { card, eyebrow } from "@/lib/ui";
import { UserIcon, CrownIcon, FileTextIcon, CheckCircleIcon } from "@/app/components/icons";

function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: (props: { className?: string }) => React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className={`${card} flex items-center gap-3 p-5`}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-soft-foreground">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-2xl font-semibold tabular-nums">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export default async function AdminPage() {
  const { userId } = await verifySession();

  const currentUser = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { isAdmin: true } });
  if (!currentUser.isAdmin) {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      fullName: true,
      plan: true,
      planRenewsAt: true,
      emailVerifiedAt: true,
      isAdmin: true,
      createdAt: true,
      _count: { select: { generatedCvs: true, generatedCoverLetters: true } },
    },
  });

  const totalUsers = users.length;
  const premiumCount = users.filter((u) => u.plan === "premium").length;
  const freeCount = totalUsers - premiumCount;
  const verifiedCount = users.filter((u) => !!u.emailVerifiedAt).length;
  const totalCvs = users.reduce((sum, u) => sum + u._count.generatedCvs, 0);
  const totalCoverLetters = users.reduce((sum, u) => sum + u._count.generatedCoverLetters, 0);

  // Bucket signups by day for the last 14 days — dataset is small enough
  // (admin-only view over this app's user count) that in-memory bucketing is
  // simpler and fine, no need for a DB-level date-trunc groupBy.
  const days = 14;
  const dayBuckets: { date: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() - i);
    dayBuckets.push({ date: d.toISOString().slice(0, 10), count: 0 });
  }
  for (const u of users) {
    const key = u.createdAt.toISOString().slice(0, 10);
    const bucket = dayBuckets.find((b) => b.date === key);
    if (bucket) bucket.count += 1;
  }

  return (
    <>
      <AppNav isAdmin />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-12">
        <div>
          <span className={eyebrow}>Panel administratora</span>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Użytkownicy i statystyki</h1>
          <p className="mt-1 text-sm text-muted-foreground">Widoczne tylko dla kont z uprawnieniami administratora.</p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <StatTile icon={UserIcon} label="Wszystkich kont" value={totalUsers} />
          <StatTile icon={CrownIcon} label="Premium" value={premiumCount} />
          <StatTile icon={UserIcon} label="Darmowy plan" value={freeCount} />
          <StatTile icon={CheckCircleIcon} label="Zweryfikowany e-mail" value={verifiedCount} />
          <StatTile icon={FileTextIcon} label="Wygenerowane CV" value={totalCvs} />
          <StatTile icon={FileTextIcon} label="Listy motywacyjne" value={totalCoverLetters} />
        </div>

        <AdminCharts dayBuckets={dayBuckets} premiumCount={premiumCount} freeCount={freeCount} />

        <AdminUserTable initialUsers={users} />
      </main>
    </>
  );
}
