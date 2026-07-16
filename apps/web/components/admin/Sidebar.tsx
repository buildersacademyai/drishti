"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearToken } from "@/lib/auth-client";

const NAV = [
  { href: "/dashboard",              icon: "⬡", label: "Dashboard" },
  { href: "/dashboard/map",          icon: "🗺", label: "Map" },
  { href: "/dashboard/missions",     icon: "🎯", label: "Missions" },
  { href: "/dashboard/detections",   icon: "🔬", label: "Detections" },
  { href: "/dashboard/interventions",icon: "💧", label: "Interventions" },
  { href: "/dashboard/alerts",       icon: "🔔", label: "Alerts" },
  { href: "/dashboard/predictions",  icon: "📊", label: "Predictions" },
  { href: "/dashboard/drones",       icon: "🚁", label: "Drones" },
  { href: "/dashboard/users",        icon: "👥", label: "Users" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    clearToken();
    router.push("/login");
  }

  return (
    <aside className="fixed top-0 left-0 h-screen w-56 bg-[#0f172a] flex flex-col z-40 border-r border-white/10">
      {/* Logo */}
      <div className="flex items-center justify-center px-5 py-4 border-b border-white/10">
        <img src="/logo.png" alt="Drishti" className="w-16 h-16 rounded-lg object-contain" />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-[#10b981]/15 text-[#10b981] font-semibold"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/40 hover:text-white hover:bg-white/5 transition-colors"
        >
          <span className="text-base w-5 text-center">⎋</span>
          Logout
        </button>
      </div>
    </aside>
  );
}
