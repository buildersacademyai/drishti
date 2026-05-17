"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth-client";
import { Sidebar } from "@/components/admin/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) router.replace("/login");
  }, [router]);

  return (
    <div className="flex h-screen bg-[#f8f7f4]">
      <Sidebar />
      <div className="flex-1 ml-56 flex flex-col min-h-screen overflow-auto">
        {children}
      </div>
    </div>
  );
}
