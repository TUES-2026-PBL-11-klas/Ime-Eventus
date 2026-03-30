import { cn } from "@/lib/utils";
import { Shield, GraduationCap, BookOpen, Eye } from "lucide-react";

export type UserRole = "admin" | "teacher" | "student" | "coordinator";

interface RoleInfo {
  role: UserRole;
  label: string;
  sublabel: string;
  icon: React.ElementType;
  initials: string;
  name: string;
}

export const roleProfiles: Record<UserRole, RoleInfo> = {
  admin: { role: "admin", label: "Administrator", sublabel: "Admin", icon: Shield, initials: "AD", name: "Alex Director" },
  teacher: { role: "teacher", label: "Teacher / Organizer", sublabel: "Teacher", icon: BookOpen, initials: "JD", name: "Jane Doe" },
  student: { role: "student", label: "Student", sublabel: "Student", icon: GraduationCap, initials: "SM", name: "Sam Miller" },
  coordinator: { role: "coordinator", label: "Coordinator", sublabel: "Leadership", icon: Eye, initials: "PC", name: "Pat Collins" },
};

interface RoleSelectorProps {
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function RoleSelector({ activeRole, onRoleChange, isOpen, onToggle }: RoleSelectorProps) {
  const current = roleProfiles[activeRole];

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center gap-3 px-4 py-3 mx-3 mt-3 rounded-lg bg-secondary cursor-pointer hover-elevate transition-all duration-200 w-[calc(100%-1.5rem)]"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
          {current.initials}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-medium text-foreground truncate">{current.name}</p>
          <p className="text-xs text-muted-foreground">{current.sublabel}</p>
        </div>
        <current.icon className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      {isOpen && (
        <div className="absolute left-3 right-3 top-full mt-1 z-50 rounded-lg bg-card elevation-2 border border-border overflow-hidden">
          <p className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Switch Role</p>
          {(Object.values(roleProfiles)).map((r) => (
            <button
              key={r.role}
              onClick={() => { onRoleChange(r.role); }}
              className={cn(
                "flex w-full items-center gap-3 px-3 py-2.5 text-sm transition-colors",
                activeRole === r.role
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-foreground hover:bg-secondary"
              )}
            >
              <r.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-left">{r.label}</span>
              {activeRole === r.role && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
