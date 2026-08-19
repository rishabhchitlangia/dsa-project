import type { Metadata } from "next";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { AddShopForm } from "@/components/AddShopForm";

export const metadata: Metadata = {
  title: "Add a shop",
  description:
    "Know a Mumbai theka or dive bar that isn't listed? Add it to the map.",
};

export default function AddShopPage() {
  return (
    <>
      <SiteHeader active="/add" />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="font-display text-3xl tracking-wide text-text sm:text-4xl">
          Add a place
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">
          Know a theka or an uncle bar that isn&apos;t on here? Add it. No
          account needed. A person checks every submission before it appears
          on the map, so it won&apos;t show up straight away.
        </p>

        <div className="mt-6">
          <AddShopForm />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
