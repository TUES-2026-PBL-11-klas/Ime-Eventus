"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/client/state/auth";
import { useRouter } from "next/navigation";
import * as eventService from "@/services/eventService";
import * as registrationService from "@/services/registrationService";
import type { EventResponseData, RegistrationResponseData } from "@/schemas/events";
import { Calendar, Clock, Users, MapPin, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function formatTime(dt: string) {
  return new Date(dt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export default function BrowseEventsPage() {
  const { token, hasRole } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<EventResponseData[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<RegistrationResponseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!hasRole("STUDENT")) {
      router.replace("/dashboard");
    }
  }, [hasRole, router]);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const [eventsRes, regRes] = await Promise.all([
      eventService.getCatalogEvents(token),
      registrationService.getMyRegistrations(token),
    ]);
    if (eventsRes.success) setEvents(eventsRes.data);
    if (regRes.success) setMyRegistrations(regRes.data);
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getMyRegistration = (eventId: string) =>
    myRegistrations.find((r) => r.eventId === eventId && r.status !== "CANCELLED");

  const handleRegister = async (eventId: string) => {
    if (!token) return;
    setError(null);
    setActionLoading(eventId);
    const res = await registrationService.registerForEvent(eventId, token);
    if (!res.success) setError(res.error);
    else await fetchData();
    setActionLoading(null);
  };

  const handleCancel = async (eventId: string) => {
    if (!token) return;
    setError(null);
    setActionLoading(eventId);
    const res = await registrationService.cancelRegistration(eventId, token);
    if (!res.success) setError(res.error);
    else await fetchData();
    setActionLoading(null);
  };

  const filtered = events.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    (e.categoryName ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const isDeadlinePassed = (event: EventResponseData) =>
    event.registrationDeadlineAt != null &&
    new Date(event.registrationDeadlineAt) < new Date();

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground leading-tight">Browse Events</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Find and register for upcoming events</p>
        </div>
      </div>

      <input
        className="w-full max-w-sm rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        placeholder="Search by title or category…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center text-sm text-muted-foreground py-12">Loading events…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-sm text-muted-foreground py-12">No events found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((event) => {
            const reg = getMyRegistration(event.id);
            const deadlinePassed = isDeadlinePassed(event);
            const isLoading = actionLoading === event.id;

            return (
              <div
                key={event.id}
                className="rounded-xl bg-card border border-border p-5 space-y-3 hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3
                    className="text-sm font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
                    onClick={() => router.push(`/dashboard/events/${event.id}`)}
                  >
                    {event.title}
                  </h3>
                  {reg && (
                    <span
                      className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
                        reg.status === "CONFIRMED"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {reg.status === "CONFIRMED" ? "Registered" : "Waitlisted"}
                    </span>
                  )}
                </div>

                {event.categoryName && (
                  <span className="inline-block text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {event.categoryName}
                  </span>
                )}

                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatDate(event.startAt)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{formatTime(event.startAt)} – {formatTime(event.endAt)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    <span>Capacity: {event.capacity}{event.allowWaitlist ? " (waitlist allowed)" : ""}</span>
                  </div>
                  {event.roomName && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{event.roomName}</span>
                    </div>
                  )}
                </div>

                {event.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{event.description}</p>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs h-7 px-2"
                    onClick={() => router.push(`/dashboard/events/${event.id}`)}
                  >
                    <BookOpen className="h-3.5 w-3.5 mr-1" /> Details
                  </Button>

                  {!reg && !deadlinePassed && (
                    <Button
                      size="sm"
                      className="text-xs h-7 px-3"
                      disabled={isLoading}
                      onClick={() => handleRegister(event.id)}
                    >
                      {isLoading ? "Registering…" : "Register"}
                    </Button>
                  )}

                  {reg && !deadlinePassed && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs h-7 px-3 text-destructive hover:bg-destructive/10"
                      disabled={isLoading}
                      onClick={() => handleCancel(event.id)}
                    >
                      {isLoading ? "Cancelling…" : "Cancel"}
                    </Button>
                  )}

                  {deadlinePassed && !reg && (
                    <span className="text-xs text-muted-foreground">Registration closed</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
