"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/client/state/auth";
import { useRouter } from "next/navigation";
import * as registrationService from "@/services/registrationService";
import type { RegistrationResponseData } from "@/schemas/events";
import { Calendar, CheckCircle2, XCircle, Clock } from "lucide-react";

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function formatTime(dt: string) {
  return new Date(dt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export default function ParticipationPage() {
  const { token, hasRole } = useAuth();
  const router = useRouter();
  const [registrations, setRegistrations] = useState<RegistrationResponseData[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Only show confirmed registrations for past events as "participation"
  const now = new Date();
  const pastEvents = registrations.filter(
    (r) => r.status === "CONFIRMED" && new Date(r.eventEndAt) < now
  );
  const upcomingEvents = registrations.filter(
    (r) => r.status === "CONFIRMED" && new Date(r.eventEndAt) >= now
  );

  const confirmed = registrations.filter((r) => r.status === "CONFIRMED").length;
  const cancelled = registrations.filter((r) => r.status === "CANCELLED").length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground leading-tight">My Participation</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Your event history and upcoming confirmed events</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Registered", value: registrations.length, icon: Calendar, color: "text-primary" },
          { label: "Confirmed", value: confirmed, icon: CheckCircle2, color: "text-green-600" },
          { label: "Past Events", value: pastEvents.length, icon: Clock, color: "text-purple-600" },
          { label: "Cancelled", value: cancelled, icon: XCircle, color: "text-destructive" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl bg-card border border-border p-4 flex items-center gap-3">
            <Icon className={`h-5 w-5 ${color}`} />
            <div>
              <p className="text-lg font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-sm text-muted-foreground py-12">Loading…</div>
      ) : (
        <>
          {upcomingEvents.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Upcoming ({upcomingEvents.length})
              </h2>
              {upcomingEvents.map((reg) => (
                <EventRow key={reg.id} reg={reg} router={router} />
              ))}
            </div>
          )}

          {pastEvents.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Past Events ({pastEvents.length})
              </h2>
              {pastEvents.map((reg) => (
                <EventRow key={reg.id} reg={reg} router={router} past />
              ))}
            </div>
          )}

          {upcomingEvents.length === 0 && pastEvents.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-12">
              No confirmed event participation yet.{" "}
              <button
                className="text-primary hover:underline"
                onClick={() => router.push("/dashboard/browse")}
              >
                Browse events
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function EventRow({
  reg,
  router,
  past = false,
}: {
  reg: RegistrationResponseData;
  router: ReturnType<typeof useRouter>;
  past?: boolean;
}) {
  return (
    <div
      className={`rounded-xl bg-card border border-border px-4 py-3 flex items-center gap-3 cursor-pointer hover:shadow-md transition-all ${past ? "opacity-70" : ""}`}
      onClick={() => router.push(`/dashboard/events/${reg.eventId}`)}
    >
      <div className="flex-1 min-w-0 space-y-0.5">
        <p className="text-sm font-semibold text-foreground truncate">{reg.eventTitle}</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(reg.eventStartAt).toLocaleDateString("en-GB", {
              day: "2-digit", month: "short", year: "numeric",
            })}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(reg.eventStartAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>
      {past ? (
        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
      ) : (
        <span className="text-xs bg-green-100 text-green-700 font-medium px-2 py-0.5 rounded-full shrink-0">
          Upcoming
        </span>
      )}
    </div>
  );
}
