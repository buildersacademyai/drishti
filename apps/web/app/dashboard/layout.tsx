"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth-client";
import { Sidebar } from "@/components/admin/Sidebar";
import { DroneLoader } from "@/components/DroneLoader";
import { LogoIcon } from "@/components/LogoIcon";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#050d1a] flex flex-col items-center justify-center gap-6">
        <LogoIcon size={72} />
        <DroneLoader />
        <p className="text-white/20 text-[10px] tracking-[0.3em] uppercase">Loading</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f8f7f4]">
      <Sidebar />
      <div className="flex-1 ml-56 flex flex-col min-h-screen overflow-auto">
        {children}
      </div>
    </div>
  );
}
