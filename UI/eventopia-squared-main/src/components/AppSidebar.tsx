import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  LayoutDashboard, Calendar, ClipboardCheck, Users, MapPin, BarChart3,
  Settings, Bell, LogOut, GraduationCap, Heart, Award, Shield, Tag,
  Eye, Activity, BookOpen,
} from "lucide-react";
import { RoleSelector, type UserRole, roleProfiles } from "@/components/RoleSelector";

interface NavItem {
  name: string;
  icon: React.ElementType;
  badge?: number;
}

const navigationByRole: Record<UserRole, NavItem[]> = {
  admin: [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "User Management", icon: Users },
    { name: "Events", icon: Calendar },
    { name: "Categories", icon: Tag },
    { name: "Rooms & Resources", icon: MapPin },
    { name: "Reports", icon: BarChart3 },
    { name: "Settings", icon: Settings },
  ],
  teacher: [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Events", icon: Calendar },
    { name: "Approvals", icon: ClipboardCheck, badge: 3 },
    { name: "Registrations", icon: Users },
    { name: "Rooms & Resources", icon: MapPin },
    { name: "Reports", icon: BarChart3 },
  ],
  student: [
    { name: "Browse Events", icon: Calendar },
    { name: "My Registrations", icon: Heart },
    { name: "My Participation", icon: Award },
  ],
  coordinator: [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Approvals", icon: ClipboardCheck, badge: 3 },
    { name: "Activity Monitor", icon: Activity },
    { name: "Reports", icon: BarChart3 },
    { name: "Rooms & Resources", icon: MapPin },
  ],
};

interface AppSidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export function AppSidebar({ activePage, onNavigate, activeRole, onRoleChange }: AppSidebarProps) {
  const [roleSelectorOpen, setRoleSelectorOpen] = useState(false);
  const navigation = navigationByRole[activeRole];

  return (
    <aside className="flex h-screen w-60 flex-col bg-card border-r border-border">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Calendar className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-semibold tracking-tight text-foreground">Eventus</span>
      </div>

      {/* Role Selector */}
      <RoleSelector
        activeRole={activeRole}
        onRoleChange={(role) => {
          onRoleChange(role);
          setRoleSelectorOpen(false);
        }}
        isOpen={roleSelectorOpen}
        onToggle={() => setRoleSelectorOpen(!roleSelectorOpen)}
      />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 pb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {activeRole === "admin" ? "Administration" : activeRole === "student" ? "My Space" : activeRole === "coordinator" ? "Coordination" : "Main"}
        </p>
        {navigation.map((item) => {
          const isActive = activePage === item.name;
          return (
            <button
              key={item.name}
              onClick={() => onNavigate(item.name)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
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
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">5</span>
        </button>
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-all duration-200">
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
