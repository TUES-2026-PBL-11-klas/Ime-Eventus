"use client";

import { cn } from "@/lib/utils";
import type { AuthUser, Role, UserRole } from "@/domain/types";
import { ROLE_DISPLAY } from "@/domain/types";
import {
  LayoutDashboard,
  Calendar,
  ClipboardCheck,
  Users,
  MapPin,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  Heart,
  Award,
  Tag,
  Activity,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

const navigationByRole: Record<UserRole, NavItem[]> = {
  admin: [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "User Management", href: "/dashboard/users", icon: Users },
    { name: "Events", href: "/dashboard/events", icon: Calendar },
    { name: "Categories", href: "/dashboard/categories", icon: Tag },
    { name: "Rooms & Resources", href: "/dashboard/rooms", icon: MapPin },
    { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ],
  teacher: [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Events", href: "/dashboard/events", icon: Calendar },
    { name: "Approvals", href: "/dashboard/approvals", icon: ClipboardCheck },
    { name: "Registrations", href: "/dashboard/registrations", icon: Users },
    { name: "Rooms & Resources", href: "/dashboard/rooms", icon: MapPin },
    { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
  ],
  student: [
    { name: "Browse Events", href: "/dashboard/browse", icon: Calendar },
    { name: "My Registrations", href: "/dashboard/my-registrations", icon: Heart },
    { name: "My Participation", href: "/dashboard/participation", icon: Award },
  ],
  coordinator: [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Approvals", href: "/dashboard/approvals", icon: ClipboardCheck },
    { name: "Activity Monitor", href: "/dashboard/activity", icon: Activity },
    { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
    { name: "Rooms & Resources", href: "/dashboard/rooms", icon: MapPin },
  ],
};

const sectionLabel: Record<UserRole, string> = {
  admin: "Administration",
  teacher: "Main",
  student: "My Space",
  coordinator: "Coordination",
};

interface AppSidebarProps {
  activePath: string;
  onNavigate: (path: string) => void;
  user: AuthUser;
  onLogout: () => void;
}

/** Resolve the primary UI role from backend role list */
function getPrimaryRole(roles: Role[]): UserRole {
  // Priority: admin > coordinator > teacher > student
  const priority: Role[] = [
    "ADMIN",
    "COORDINATOR",
    "TEACHER",
    "STUDENT",
  ];
  for (const r of priority) {
    if (roles.includes(r)) return ROLE_DISPLAY[r];
  }
  return "student";
}

export function AppSidebar({ activePath, onNavigate, user, onLogout }: AppSidebarProps) {
  const role = getPrimaryRole(user.roles);
  const navigation = navigationByRole[role];

  return (
    <aside className="flex h-screen w-60 flex-col bg-card border-r border-border">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Calendar className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-semibold tracking-tight text-foreground">
          Eventus
        </span>
      </div>

      {/* User info */}
      <div className="px-5 py-3 border-b border-border">
        <p className="text-sm font-medium text-foreground truncate">
          {user.fullName}
        </p>
        <p className="text-xs text-muted-foreground capitalize">{role}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 pb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {sectionLabel[role]}
        </p>
        {navigation.map((item) => {
          const isActive = activePath === item.href;
          return (
            <button
              key={item.href}
              onClick={() => onNavigate(item.href)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-left">{item.name}</span>
              {item.badge && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-medium text-destructive-foreground">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 space-y-0.5 border-t border-border pt-3">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200">
          <Bell className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">Notifications</span>
        </button>
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-all duration-200"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
