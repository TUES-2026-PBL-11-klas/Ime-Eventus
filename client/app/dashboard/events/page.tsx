"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/client/state/auth";
import { useRouter } from "next/navigation";
import * as eventService from "@/services/eventService";
import type { EventResponseData, EventStatusType } from "@/schemas/events";
import { Plus, Search, Grid3X3, List } from "lucide-react";
import { EventCard } from "@/components/EventCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Calendar, Clock, Users, MapPin, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const ALL_STATUSES: EventStatusType[] = [
  "DRAFT", "PENDING_APPROVAL", "APPROVED", "PUBLISHED", "COMPLETED", "CANCELLED",
];

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
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
  const [statusFilter, setStatusFilter] = useState<EventStatusType | "ALL">("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    if (!hasRole("TEACHER") && !hasRole("COORDINATOR") && !hasRole("ADMIN")) {
      router.replace("/dashboard");
    }
  }, [hasRole, router]);

  const fetchEvents = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const res = await eventService.getAllEvents(token);
    if (res.success) setEvents(res.data);
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const filtered = events.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      (e.categoryName ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (e.organizerName ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground leading-tight">Event Catalog</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{events.length} events across all categories</p>
        </div>
        <Button onClick={() => router.push("/dashboard/events/create")} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Event
        </Button>
      </div>

      {/* Filters row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Status filter pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
              statusFilter === "ALL"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-muted"
            }`}
          >
            All
          </button>
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                statusFilter === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Search + view toggle */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search events…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-52 rounded-lg border border-border bg-card pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 transition-colors ${viewMode === "grid" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary"}`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 transition-colors ${viewMode === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary"}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center text-sm text-muted-foreground py-16">Loading events…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-sm text-muted-foreground py-16">No events found.</div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onClick={() => router.push(`/dashboard/events/${event.id}`)}
            />
          ))}
        </div>
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
                  <StatusBadge status={event.status} />
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(event.startAt)}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatTime(event.startAt)} – {formatTime(event.endAt)}</span>
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />{event.capacity} seats</span>
                  {event.roomName && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.roomName}</span>}
                  {event.categoryName && <span className="text-primary">{event.categoryName}</span>}
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
