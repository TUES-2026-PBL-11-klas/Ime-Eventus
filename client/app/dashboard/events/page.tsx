"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/client/state/auth";
import { useRouter } from "next/navigation";
import * as eventService from "@/services/eventService";
import type { EventResponseData } from "@/schemas/events";
import { Calendar, Clock, Users, MapPin, ChevronRight } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  PENDING_APPROVAL: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-blue-100 text-blue-700",
  PUBLISHED: "bg-green-100 text-green-700",
  COMPLETED: "bg-purple-100 text-purple-700",
  CANCELLED: "bg-red-100 text-red-700",
  CONFLICT: "bg-orange-100 text-orange-700",
  FULLY_BOOKED: "bg-gray-100 text-gray-600",
};

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function formatTime(dt: string) {
  return new Date(dt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export default function EventsPage() {
  const { token, hasRole } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<EventResponseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!hasRole("TEACHER") && !hasRole("COORDINATOR") && !hasRole("ADMIN")) {
      router.replace("/dashboard");
    }
  }, [hasRole, router]);

  const fetchEvents = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const res = await eventService.getCatalogEvents(token);
    if (res.success) setEvents(res.data);
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const filtered = events.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    (e.categoryName ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (e.organizerName ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-foreground leading-tight">Events</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Browse published and approved events</p>
      </div>

      <input
        className="w-full max-w-sm rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        placeholder="Search by title, category or organizer…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <div className="text-center text-sm text-muted-foreground py-12">Loading events…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-sm text-muted-foreground py-12">No events found.</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((event) => (
            <div
              key={event.id}
              className="rounded-xl bg-card border border-border px-5 py-4 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
              onClick={() => router.push(`/dashboard/events/${event.id}`)}
            >
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground truncate">{event.title}</h3>
                  <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[event.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {event.status.replace("_", " ")}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />{formatDate(event.startAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />{formatTime(event.startAt)} – {formatTime(event.endAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />{event.capacity} seats
                  </span>
                  {event.roomName && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />{event.roomName}
                    </span>
                  )}
                  {event.categoryName && (
                    <span className="text-primary">{event.categoryName}</span>
                  )}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
