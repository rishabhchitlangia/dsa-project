import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { ADMIN_COOKIE, isValidAdminToken, adminTokenConfigured } from "@/lib/adminAuth";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { PendingList } from "@/components/admin/PendingList";
import { CurateList } from "@/components/admin/CurateList";
import type { CategoryValue } from "@/lib/validation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Curator",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const jar = await cookies();
  const authed = isValidAdminToken(jar.get(ADMIN_COOKIE)?.value);

  if (!authed) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        {!adminTokenConfigured() && (
          <p className="mx-auto max-w-sm rounded-card bg-warn-soft px-4 py-3 text-sm text-warn">
            <code>ADMIN_TOKEN</code> isn&apos;t set, or is shorter than 16
            characters. Add it to <code>.env</code> and restart.
          </p>
        )}
        <AdminLogin />
      </main>
    );
  }

  const [pending, approved, rejectedCount] = await Promise.all([
    prisma.shop.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "asc" },
    }),
    prisma.shop.findMany({
      where: { status: "approved" },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        area: true,
        address: true,
        category: true,
        source: true,
      },
    }),
    prisma.shop.count({ where: { status: "rejected" } }),
  ]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl tracking-wide text-text">
          Curator
        </h1>
        <Link href="/" className="text-sm font-medium text-muted hover:text-accent">
          ← Back to the site
        </Link>
      </div>

      <section className="mt-6">
        <h2 className="text-base font-semibold text-text">
          Pending submissions
          {pending.length > 0 && (
            <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-xs text-white tabular-nums">
              {pending.length}
            </span>
          )}
        </h2>
        <p className="mb-3 mt-1 text-sm text-muted">
          Nothing here is on the public map yet.
          {rejectedCount > 0 && ` ${rejectedCount} previously rejected.`}
        </p>
        <PendingList
          shops={pending.map((s) => ({
            id: s.id,
            name: s.name,
            address: s.address,
            area: s.area,
            pincode: s.pincode,
            latitude: s.latitude,
            longitude: s.longitude,
            phone: s.phone,
            hoursWeekday: s.hoursWeekday,
            hoursWeekend: s.hoursWeekend,
            suggestedCategory: (s.suggestedCategory ?? null) as CategoryValue | null,
            submittedByName: s.submittedByName,
            submittedNote: s.submittedNote,
            createdAt: s.createdAt.toISOString(),
          }))}
        />
      </section>

      <section className="mt-10">
        <h2 className="text-base font-semibold text-text">
          Curate Legendary &amp; Dive Bars
        </h2>
        <p className="mb-3 mt-1 text-sm text-muted">
          These two lists are manual by design. Imported shops all start as
          plain thekas — promote them here.
        </p>
        <CurateList
          shops={approved.map((s) => ({
            id: s.id,
            name: s.name,
            area: s.area,
            address: s.address,
            category: s.category as CategoryValue,
            source: s.source,
            osmKindHint: s.source === "osm" ? "from OpenStreetMap" : s.source === "community" ? "community added" : null,
          }))}
        />
      </section>
    </main>
  );
}
