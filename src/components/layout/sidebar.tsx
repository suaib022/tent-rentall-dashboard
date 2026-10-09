"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Inbox,
  CalendarDays,
  FileText,
  Briefcase,
  GitMerge,
  Users,
  Package,
  CalendarCheck,
  Bot,
  MessageSquare,
  BarChart3,
  Settings,
  Tent,
  Archive
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  // { name: "Inbox", href: "/inbox", icon: Inbox },
  { name: "Schedule", href: "/schedule", icon: CalendarDays },
  { name: "Quotes", href: "/quotes", icon: FileText },
  { name: "Bookings", href: "/bookings", icon: Briefcase },
  { name: "Rentals", href: "/rentals", icon: Tent },
  { name: "Change Requests", href: "/change-requests", icon: GitMerge },
  // { name: "Customers", href: "/customers", icon: Users },
  { name: "Tents", href: "/tents", icon: Tent },
  { name: "Packages", href: "/packages", icon: Package },
  { name: "Accessories", href: "/accessories", icon: Archive },
  { name: "Availability", href: "/availability", icon: CalendarCheck },
  // { name: "Agent Activity", href: "/agent-activity", icon: Bot },
  // { name: "Conversations", href: "/conversations", icon: MessageSquare },
  // { name: "Reports", href: "/reports", icon: BarChart3 },
  // { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-[#10253B] text-slate-100 px-4 py-6 shadow-xl relative z-10">
      <div className="mb-8 px-2">
        <h1 className="text-3xl font-bold tracking-widest text-[#d83a2e] uppercase" style={{ fontFamily: "Manrope, sans-serif" }}>
          OAKDALE
        </h1>
        <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mt-1">Admin</p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto min-h-0 pr-2 pb-4 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (pathname !== '/' && pathname?.startsWith(item.href) && item.href !== '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-base font-medium transition-all duration-200",
                isActive
                  ? "bg-[#d83a2e] text-white shadow-md"
                  : "text-slate-300 hover:bg-[#1a3857] hover:text-white"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                  isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto px-2">
        <div className="rounded-md bg-[#0a1827] p-4 border border-[#1a3857]">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-[#d83a2e] flex items-center justify-center text-white font-bold shadow-sm">
              A
            </div>
            <div className="text-base">
              <p className="font-medium text-slate-100">Admin User</p>
              <p className="text-sm text-slate-400">admin@oakdaletents.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
