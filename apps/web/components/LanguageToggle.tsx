"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function LanguageToggle({ current }: { current: "en" | "ne" }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = current === "en" ? "ne" : "en";
    document.cookie = `locale=${next}; path=/; max-age=31536000; SameSite=Lax`;
    startTransition(() => router.refresh());
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className="px-3 py-1 rounded-full text-xs font-semibold border border-white/30 hover:bg-white/10 transition-colors disabled:opacity-50"
      aria-label="Toggle language"
    >
      {current === "en" ? "नेपाली" : "English"}
    </button>
  );
}
