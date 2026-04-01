"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/client/state/auth";
import { useRouter } from "next/navigation";
import * as userService from "@/services/userService";
import type { UserResponseData } from "@/schemas/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Shield,
  BookOpen,
  GraduationCap,
  Eye,
  Search,
} from "lucide-react";

type RoleKey = "admin" | "teacher" | "student" | "coordinator";

const roleIcons: Record<RoleKey, React.ElementType> = {
  admin: Shield,
  teacher: BookOpen,
  student: GraduationCap,
  coordinator: Eye,
};
const roleColors: Record<RoleKey, string> = {
  admin: "text-destructive bg-destructive/10",
  teacher: "text-primary bg-primary/10",
  student: "text-success bg-success/10",
  coordinator: "text-accent bg-accent/10",
};

function mapRole(role: string): RoleKey {
  if (role.includes("ADMIN")) return "admin";
  if (role.includes("COORDINATOR")) return "coordinator";
  if (role.includes("TEACHER")) return "teacher";
  return "student";
}

export default function UsersPage() {
  const { token, hasRole } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserResponseData[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasRole("ROLE_ADMIN")) {
      router.replace("/dashboard");
      return;
    }
  }, [hasRole, router]);

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const res = await userService.getAllUsers(token);
    if (res.success) {
      setUsers(res.data);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDeactivate = async (id: number) => {
    if (!token) return;
    const res = await userService.deactivateUser(id, token);
    if (res.success) {
      fetchUsers();
    }
  };

  const filtered = users.filter(
    (u) =>
      u.firstName.toLowerCase().includes(search.toLowerCase()) ||
      u.lastName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  const roleCounts = (role: RoleKey) =>
    users.filter((u) => u.roles.some((r) => mapRole(r) === role)).length;

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground leading-tight">
            User Management
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {users.length} users across all roles
          </p>
        </div>
      </div>

      {/* Role summary cards */}
      <div className="grid grid-cols-4 gap-4">
        {(["admin", "teacher", "student", "coordinator"] as const).map((role) => {
          const Icon = roleIcons[role];
          const count = roleCounts(role);
          return (
            <div
              key={role}
              className="rounded-xl bg-card border border-border p-4 flex items-center gap-3"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${roleColors[role]}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{count}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {role}s
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl bg-card border border-border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            Loading users…
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  User
                </th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Role
                </th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((user) => {
                const roleKey = mapRole(user.roles[0] ?? "ROLE_STUDENT");
                const Icon = roleIcons[roleKey];
                return (
                  <tr
                    key={user.id}
                    className="hover:bg-secondary/50 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${roleColors[roleKey]}`}
                      >
                        <Icon className="h-3 w-3" />{" "}
                        {roleKey.charAt(0).toUpperCase() + roleKey.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium ${user.active ? "text-success" : "text-muted-foreground"}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${user.active ? "bg-success" : "bg-muted-foreground"}`}
                        />
                        {user.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {user.active && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeactivate(user.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          Deactivate
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-8 text-center text-sm text-muted-foreground"
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
