"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/client/state/auth";
import { useRouter } from "next/navigation";
import * as eventService from "@/services/eventService";
import * as registrationService from "@/services/registrationService";
import type { EventResponseData, RegistrationResponseData } from "@/schemas/events";
import { Users, ArrowRight, Search } from "lucide-react";

const STATUS_BADGE: Record<string, string> = {
  CONFIRMED: "bg-green-100 text-green-700",
  WAITLISTED: "bg-yellow-100 text-yellow-700",
  CANCELLED: "bg-gray-100 text-gray-500",
};

export default function RegistrationsPage() {
  const { token, user, hasRole } = useAuth();
  const router = useRouter();

  const [events, setEvents] = useState<EventResponseData[]>([]);
  const [registrations, setRegistrations] = useState<Record<string, RegistrationResponseData[]>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasRole("TEACHER") && !hasRole("COORDINATOR") && !hasRole("ADMIN")) {
      router.replace("/dashboard");
    }
  }, [hasRole, router]);

  const fetchEvents = useCallback(async () => {
    if (!token || !user) return;
    setLoading(true);
    const res = await eventService.getAllEvents(token);
    if (res.success) {
      const mine = hasRole("ADMIN")
        ? res.data
        : res.data.filter((e) => e.organizerId === user.id);
      setEvents(mine);
    }
    setLoading(false);
  }, [token, user, hasRole]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const loadRegistrations = async (eventId: string) => {
    if (!token) return;
    if (expanded === eventId) {
      setExpanded(null);
      return;
    }
    if (!registrations[eventId]) {
      const res = await registrationService.getEventRegistrations(eventId, token);
      if (res.success) {
        setRegistrations((prev) => ({ ...prev, [eventId]: res.data }));
      }
    }
    setExpanded(eventId);
  };

  const filtered = events.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase())
  );

  const confirmedCount = (eventId: string) =>
    (registrations[eventId] ?? []).filter((r) => r.status === "CONFIRMED").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Registrations</h1>
        <p className="text-sm text-muted-foreground mt-0.5">View registrations for your events</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="Search events…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center text-sm text-muted-foreground py-12">
          No events found.
        </div>
      ) : (
        <div className="rounded-xl border border-border divide-y divide-border bg-card">
          {filtered.map((event) => (
            <div key={event.id}>
              <button
                onClick={() => loadRegistrations(event.id)}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-secondary/50 transition-colors text-left"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(event.startAt).toLocaleDateString("en-GB", {
                      day: "2-digit", month: "short", year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    event.status === "APPROVED" ? "bg-green-100 text-green-700" :
                    event.status === "PUBLISHED" ? "bg-blue-100 text-blue-700" :
                    event.status === "CANCELLED" ? "bg-red-100 text-red-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {event.status}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    {expanded === event.id
                      ? `${confirmedCount(event.id)} confirmed`
                      : event.capacity + " cap"}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/events/${event.id}`); }}
                    className="p-1 rounded hover:bg-secondary transition-colors"
                    title="Go to event"
                  >
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </button>

              {expanded === event.id && (
                <div className="border-t border-border bg-secondary/20">
                  {!registrations[event.id] ? (
                    <div className="px-4 py-3 text-xs text-muted-foreground">Loading…</div>
                  ) : registrations[event.id].length === 0 ? (
                    <div className="px-4 py-3 text-xs text-muted-foreground">No registrations yet.</div>
                  ) : (
                    <div className="divide-y divide-border">
                      {registrations[event.id].map((reg) => (
                        <div key={reg.id} className="px-6 py-2.5 flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground">{reg.studentName}</p>
                            <p className="text-xs text-muted-foreground">
                              Registered {new Date(reg.registeredAt).toLocaleDateString("en-GB", {
                                day: "2-digit", month: "short",
                              })}
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[reg.status]}`}>
                            {reg.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
