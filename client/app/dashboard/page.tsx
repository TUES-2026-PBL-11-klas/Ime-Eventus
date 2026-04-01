"use client";

import { useAuth } from "@/client/state/auth";
import { ROLE_DISPLAY } from "@/domain/types";
import { Calendar, Users, ClipboardCheck, BarChart3 } from "lucide-react";

const stats = [
  { label: "Total Events", value: "—", icon: Calendar, color: "text-primary bg-primary/10" },
  { label: "Active Users", value: "—", icon: Users, color: "text-success bg-success/10" },
  { label: "Pending Approvals", value: "—", icon: ClipboardCheck, color: "text-warning bg-warning/10" },
  { label: "This Month", value: "—", icon: BarChart3, color: "text-accent bg-accent/10" },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const role = user?.roles[0] ? ROLE_DISPLAY[user.roles[0]] : "user";

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground leading-tight">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Welcome back, {user?.firstName}. You are signed in as{" "}
          <span className="capitalize font-medium">{role}</span>.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl bg-card border border-border p-5 flex items-center gap-4"
          >
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-lg ${s.color}`}
            >
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder for upcoming events, approvals, etc. */}
      <div className="rounded-xl bg-card border border-border p-8 text-center text-muted-foreground">
        <p className="text-sm">
          More dashboard widgets will appear here as features are implemented by
          the team.
        </p>
      </div>
    </div>
  );
}
