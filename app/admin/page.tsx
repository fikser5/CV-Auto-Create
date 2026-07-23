import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { AppNav } from "@/app/components/AppNav";
import { AdminCharts } from "@/app/admin/AdminCharts";
import { AdminUserTable } from "@/app/admin/AdminUserTable";
import { estimateUsdCost } from "@/lib/admin-usage";
import { card, eyebrow } from "@/lib/ui";
import { UserIcon, CrownIcon, FileTextIcon, CheckCircleIcon, SparklesIcon } from "@/app/components/icons";

const SUSPICIOUS_CV_THRESHOLD_24H = 4;

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

  const days = 14;
  const rangeStart = new Date();
  rangeStart.setUTCHours(0, 0, 0, 0);
  rangeStart.setUTCDate(rangeStart.getUTCDate() - (days - 1));
  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [users, usageLogs, totalUsageAgg, recentCvs] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        fullName: true,
        plan: true,
        planRenewsAt: true,
        purchasedCredits: true,
        emailVerifiedAt: true,
        isAdmin: true,
        createdAt: true,
        _count: { select: { generatedCvs: true, generatedCoverLetters: true } },
      },
    }),
    prisma.apiUsageLog.findMany({
      where: { createdAt: { gte: rangeStart } },
      select: { createdAt: true, inputTokens: true, outputTokens: true },
    }),
    prisma.apiUsageLog.aggregate({ _sum: { inputTokens: true, outputTokens: true } }),
    prisma.generatedCv.findMany({
      where: { createdAt: { gte: last24h } },
      select: { userId: true },
    }),
  ]);

  const totalUsers = users.length;
  const premiumCount = users.filter((u) => u.plan === "premium").length;
  const freeCount = totalUsers - premiumCount;
  const verifiedCount = users.filter((u) => !!u.emailVerifiedAt).length;
  const totalCvs = users.reduce((sum, u) => sum + u._count.generatedCvs, 0);
  const totalCoverLetters = users.reduce((sum, u) => sum + u._count.generatedCoverLetters, 0);
  const totalCostUsd = estimateUsdCost(totalUsageAgg._sum.inputTokens ?? 0, totalUsageAgg._sum.outputTokens ?? 0);

  // Bucket signups + API cost by day for the last 14 days — dataset is small
  // enough (admin-only view over this app's user/usage count) that in-memory
  // bucketing is simpler and fine, no need for a DB-level date-trunc groupBy.
  const dayBuckets: { date: string; count: number }[] = [];
  const costBuckets: { date: string; cost: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    dayBuckets.push({ date: key, count: 0 });
    costBuckets.push({ date: key, cost: 0 });
  }
  for (const u of users) {
    const key = u.createdAt.toISOString().slice(0, 10);
    const bucket = dayBuckets.find((b) => b.date === key);
    if (bucket) bucket.count += 1;
  }
  for (const log of usageLogs) {
    const key = log.createdAt.toISOString().slice(0, 10);
    const bucket = costBuckets.find((b) => b.date === key);
    if (bucket) bucket.cost += estimateUsdCost(log.inputTokens, log.outputTokens);
  }

  const cvCountByUser = new Map<string, number>();
  for (const cv of recentCvs) {
    cvCountByUser.set(cv.userId, (cvCountByUser.get(cv.userId) ?? 0) + 1);
  }
  const flaggedUsers = users
    .map((u) => ({ email: u.email, count: cvCountByUser.get(u.id) ?? 0 }))
    .filter((u) => u.count >= SUSPICIOUS_CV_THRESHOLD_24H)
    .sort((a, b) => b.count - a.count);

  return (
    <>
      <AppNav isAdmin />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-12">
        <div>
          <span className={eyebrow}>Panel administratora</span>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Użytkownicy i statystyki</h1>
          <p className="mt-1 text-sm text-muted-foreground">Widoczne tylko dla kont z uprawnieniami administratora.</p>
        </div>

        {flaggedUsers.length > 0 && (
          <div className="flex items-start gap-3 rounded-card border border-danger/30 bg-danger-soft p-5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-card text-danger">
              <SparklesIcon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-danger">Podejrzana aktywność</p>
              <p className="mt-0.5 text-sm text-danger">
                {flaggedUsers.length === 1 ? "To konto wygenerowało" : "Te konta wygenerowały"} {SUSPICIOUS_CV_THRESHOLD_24H}+ CV
                w ciągu ostatnich 24h:{" "}
                {flaggedUsers.map((u) => `${u.email} (${u.count})`).join(", ")}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
          <StatTile icon={UserIcon} label="Wszystkich kont" value={totalUsers} />
          <StatTile icon={CrownIcon} label="Premium" value={premiumCount} />
          <StatTile icon={UserIcon} label="Darmowy plan" value={freeCount} />
          <StatTile icon={CheckCircleIcon} label="Zweryfikowany e-mail" value={verifiedCount} />
          <StatTile icon={FileTextIcon} label="Wygenerowane CV" value={totalCvs} />
          <StatTile icon={FileTextIcon} label="Listy motywacyjne" value={totalCoverLetters} />
          <StatTile icon={SparklesIcon} label="Koszt API (łącznie)" value={`$${totalCostUsd.toFixed(2)}`} />
        </div>

        <AdminCharts dayBuckets={dayBuckets} premiumCount={premiumCount} freeCount={freeCount} costBuckets={costBuckets} />

        <AdminUserTable initialUsers={users} />
      </main>
    </>
  );
}
