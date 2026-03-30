import { motion } from "framer-motion";
import { Settings, Bell, Shield, Clock, Globe, Database } from "lucide-react";

interface SettingGroup {
  title: string;
  icon: React.ElementType;
  settings: { label: string; description: string; type: "toggle" | "select" | "input"; value?: string; enabled?: boolean }[];
}

const settingGroups: SettingGroup[] = [
  {
    title: "General",
    icon: Globe,
    settings: [
      { label: "School Name", description: "Displayed across the platform", type: "input", value: "Lincoln High School" },
      { label: "Academic Year", description: "Current academic year", type: "select", value: "2025-2026" },
      { label: "Timezone", description: "Default timezone for events", type: "select", value: "EST (UTC-5)" },
    ],
  },
  {
    title: "Notifications",
    icon: Bell,
    settings: [
      { label: "Email Notifications", description: "Send emails for event updates", type: "toggle", enabled: true },
      { label: "Approval Alerts", description: "Notify coordinators of pending approvals", type: "toggle", enabled: true },
      { label: "Registration Confirmations", description: "Auto-confirm student registrations", type: "toggle", enabled: false },
    ],
  },
  {
    title: "Security",
    icon: Shield,
    settings: [
      { label: "Two-Factor Authentication", description: "Require 2FA for admin accounts", type: "toggle", enabled: false },
      { label: "Session Timeout", description: "Auto-logout after inactivity", type: "select", value: "30 minutes" },
    ],
  },
  {
    title: "Event Defaults",
    icon: Clock,
    settings: [
      { label: "Default Capacity", description: "Default max registrations", type: "input", value: "30" },
      { label: "Require Approval", description: "All events must be approved before publishing", type: "toggle", enabled: true },
      { label: "Allow Waitlist", description: "Enable waitlist when events are full", type: "toggle", enabled: true },
    ],
  },
];

export function AdminSettingsView() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground leading-tight">System Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Configure platform-wide preferences</p>
      </div>

      <div className="space-y-6">
        {settingGroups.map((group, gi) => (
          <motion.div key={group.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.08 }} className="rounded-xl bg-card elevation-1 overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
              <group.icon className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">{group.title}</h3>
            </div>
            <div className="divide-y divide-border">
              {group.settings.map((setting) => (
                <div key={setting.label} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">{setting.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{setting.description}</p>
                  </div>
                  {setting.type === "toggle" ? (
                    <div className={`relative h-6 w-11 rounded-full cursor-pointer transition-colors ${setting.enabled ? "bg-primary" : "bg-muted"}`}>
                      <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-card elevation-1 transition-transform ${setting.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
                    </div>
                  ) : setting.type === "select" ? (
                    <select className="h-8 rounded-lg border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20">
                      <option>{setting.value}</option>
                    </select>
                  ) : (
                    <input type="text" defaultValue={setting.value} className="h-8 w-48 rounded-lg border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-end">
        <button className="h-9 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all">
          Save Changes
        </button>
      </div>
    </div>
  );
}
