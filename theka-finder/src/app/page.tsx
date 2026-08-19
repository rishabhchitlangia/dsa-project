import { HomeExplorer } from "@/components/HomeExplorer";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { searchShops } from "@/lib/shops";

// Reviews and verification change through the day, so never serve a stale
// shell from the build.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Server-render a Mumbai-wide result so the first paint has content even
  // before the user searches or shares their location.
  const initial = await searchShops({ limit: 30 });

  return (
    <>
      <SiteHeader active="/" />
      <main>
        <HomeExplorer initial={initial} />
      </main>
      <SiteFooter />
    </>
  );
}
