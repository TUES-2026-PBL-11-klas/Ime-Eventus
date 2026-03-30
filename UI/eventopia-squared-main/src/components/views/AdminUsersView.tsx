import { motion } from "framer-motion";
import { Shield, BookOpen, GraduationCap, Eye, MoreHorizontal, Search, Plus, UserPlus } from "lucide-react";

interface UserRecord {
  name: string;
  email: string;
  role: "admin" | "teacher" | "student" | "coordinator";
  status: "active" | "inactive";
  lastActive: string;
}

const users: UserRecord[] = [
  { name: "Alex Director", email: "alex@school.edu", role: "admin", status: "active", lastActive: "Today" },
  { name: "Jane Doe", email: "jane@school.edu", role: "teacher", status: "active", lastActive: "Today" },
  { name: "Mr. Thompson", email: "thompson@school.edu", role: "teacher", status: "active", lastActive: "Yesterday" },
  { name: "Ms. Rivera", email: "rivera@school.edu", role: "teacher", status: "active", lastActive: "Today" },
  { name: "Dr. Kim", email: "kim@school.edu", role: "teacher", status: "active", lastActive: "Mar 14" },
  { name: "Pat Collins", email: "pat@school.edu", role: "coordinator", status: "active", lastActive: "Today" },
  { name: "Sam Miller", email: "sam@school.edu", role: "student", status: "active", lastActive: "Today" },
  { name: "Alice Johnson", email: "alice@school.edu", role: "student", status: "active", lastActive: "Yesterday" },
  { name: "Bob Smith", email: "bob@school.edu", role: "student", status: "inactive", lastActive: "Feb 28" },
  { name: "Carol Davis", email: "carol@school.edu", role: "student", status: "active", lastActive: "Mar 13" },
];

const roleIcons = { admin: Shield, teacher: BookOpen, student: GraduationCap, coordinator: Eye };
const roleColors = { admin: "text-destructive bg-destructive/10", teacher: "text-primary bg-primary/10", student: "text-success bg-success/10", coordinator: "text-accent bg-accent/10" };

export function AdminUsersView() {
  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground leading-tight">User Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{users.length} users across all roles</p>
        </div>
        <button className="flex items-center gap-2 h-9 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all hover:-translate-y-px">
          <UserPlus className="h-4 w-4" /> Add User
        </button>
      </div>

      {/* Role summary */}
      <div className="grid grid-cols-4 gap-4">
        {(["admin", "teacher", "student", "coordinator"] as const).map((role, i) => {
          const Icon = roleIcons[role];
          const count = users.filter(u => u.role === role).length;
          return (
            <motion.div key={role} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-xl bg-card elevation-1 p-4 flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${roleColors[role]}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{count}</p>
                <p className="text-xs text-muted-foreground capitalize">{role}s</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input type="text" placeholder="Search users..." className="h-9 w-full rounded-lg border border-border bg-card pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
      </div>

      <div className="rounded-xl bg-card elevation-1 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">User</th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Role</th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Last Active</th>
              <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user, i) => {
              const Icon = roleIcons[user.role];
              return (
                <motion.tr key={user.email} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${roleColors[user.role]}`}>
                      <Icon className="h-3 w-3" /> {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${user.status === "active" ? "text-success" : "text-muted-foreground"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${user.status === "active" ? "bg-success" : "bg-muted-foreground"}`} />
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{user.lastActive}</td>
                  <td className="px-5 py-3 text-right">
                    <button className="p-1.5 rounded-lg hover:bg-secondary transition-colors"><MoreHorizontal className="h-4 w-4 text-muted-foreground" /></button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
