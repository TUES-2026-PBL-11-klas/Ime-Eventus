"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/client/state/auth";
import { useRouter } from "next/navigation";
import * as registrationService from "@/services/registrationService";
import type { RegistrationResponseData } from "@/schemas/events";
import { Calendar, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function formatTime(dt: string) {
  return new Date(dt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: "bg-green-100 text-green-700",
  WAITLISTED: "bg-yellow-100 text-yellow-700",
  CANCELLED: "bg-gray-100 text-gray-500",
};

export default function MyRegistrationsPage() {
  const { token, hasRole } = useAuth();
  const router = useRouter();
  const [registrations, setRegistrations] = useState<RegistrationResponseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "cancelled">("active");

  useEffect(() => {
    if (!hasRole("STUDENT")) router.replace("/dashboard");
  }, [hasRole, router]);

  const fetchRegistrations = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const res = await registrationService.getMyRegistrations(token);
    if (res.success) setRegistrations(res.data);
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchRegistrations(); }, [fetchRegistrations]);

  const handleCancel = async (eventId: string) => {
    if (!token) return;
    setError(null);
    setActionLoading(eventId);
    const res = await registrationService.cancelRegistration(eventId, token);
    if (!res.success) setError(res.error);
    else await fetchRegistrations();
    setActionLoading(null);
  };

  const filtered = registrations.filter((r) => {
    if (filter === "active") return r.status !== "CANCELLED";
    if (filter === "cancelled") return r.status === "CANCELLED";
    return true;
  });

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-foreground leading-tight">My Registrations</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Events you have registered for</p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {(["active", "all", "cancelled"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${
              filter === f
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center text-sm text-muted-foreground py-12">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-sm text-muted-foreground py-12">
          {filter === "active" ? "No active registrations." : "No registrations found."}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((reg) => {
            const isLoading = actionLoading === reg.eventId;
            const deadlinePassed = false; // event deadline not in list view — safe to allow cancel attempt; backend enforces it

            return (
              <div
                key={reg.id}
                className="rounded-xl bg-card border border-border p-4 flex items-center gap-4"
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3
                      className="text-sm font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
                      onClick={() => router.push(`/dashboard/events/${reg.eventId}`)}
                    >
                      {reg.eventTitle}
                    </h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[reg.status]}`}>
                      {reg.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />{formatDate(reg.eventStartAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />{formatTime(reg.eventStartAt)} – {formatTime(reg.eventEndAt)}
                    </span>
                  </div>
                  {reg.status === "CANCELLED" && reg.cancellationReason && (
                    <p className="text-xs text-muted-foreground">Reason: {reg.cancellationReason}</p>
                  )}
                </div>

                {reg.status !== "CANCELLED" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="shrink-0 text-destructive hover:bg-destructive/10 h-7 w-7 p-0"
                    disabled={isLoading}
                    onClick={() => handleCancel(reg.eventId)}
                    title="Cancel registration"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
