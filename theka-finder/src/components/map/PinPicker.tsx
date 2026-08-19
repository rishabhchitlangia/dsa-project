"use client";

import dynamic from "next/dynamic";

const Inner = dynamic(() => import("./PinPickerInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-surface-2">
      <span className="text-sm text-muted">Loading map…</span>
    </div>
  ),
});

export function PinPicker(props: {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number) => void;
}) {
  return <Inner {...props} />;
}
