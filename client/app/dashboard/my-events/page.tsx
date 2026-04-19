"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/client/state/auth";
import { useRouter } from "next/navigation";
import * as eventService from "@/services/eventService";
import * as approvalService from "@/services/approvalService";
import type { EventResponseData } from "@/schemas/events";
import { Plus, Calendar, Clock, Users, MapPin, Pencil, Send, Eye, BookOpen } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function formatTime(dt: string) {
  return new Date(dt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

const STATUS_ORDER: Record<string, number> = {
  DRAFT: 0,
  PENDING_APPROVAL: 1,
  APPROVED: 2,
  PUBLISHED: 3,
  COMPLETED: 4,
  CANCELLED: 5,
};

export default function MyEventsPage() {
  const { token, hasRole } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<EventResponseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  useEffect(() => {
    if (!hasRole("TEACHER") && !hasRole("COORDINATOR") && !hasRole("ADMIN")) {
      router.replace("/dashboard");
    }
  }, [hasRole, router]);

  const fetchEvents = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const res = await eventService.getMyEvents(token);
    if (res.success) {
      const sorted = [...res.data].sort(
        (a, b) => (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99)
      );
      setEvents(sorted);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubmitForApproval = async (eventId: string) => {
    if (!token) return;
    setSubmitting(eventId);
    try {
      const res = await approvalService.submitForApproval(token, eventId);
      if (res.success) {
        showToast("Event submitted for approval.", true);
        await fetchEvents();
      } else {
        showToast("Failed to submit for approval.", false);
      }
    } finally {
      setSubmitting(null);
    }
  };

  const handlePublish = async (eventId: string) => {
    if (!token) return;
    setPublishing(eventId);
    try {
      const res = await eventService.publishEvent(token, eventId);
      if (res.success) {
        showToast("Event published successfully.", true);
        await fetchEvents();
      } else {
        showToast("Failed to publish event.", false);
      }
    } finally {
      setPublishing(null);
    }
  };

  const draftCount = events.filter((e) => e.status === "DRAFT").length;
  const pendingCount = events.filter((e) => e.status === "PENDING_APPROVAL").length;
  const approvedCount = events.filter((e) => e.status === "APPROVED").length;
  const publishedCount = events.filter((e) => e.status === "PUBLISHED").length;

  return (
    <div className="p-6 space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 rounded-lg px-4 py-3 text-sm font-medium shadow-lg transition-all ${
            toast.ok
              ? "bg-green-600 text-white"
              : "bg-destructive text-destructive-foreground"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground leading-tight">My Events</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage and track your events through the approval workflow</p>
        </div>
        <Button onClick={() => router.push("/dashboard/events/create")} className="gap-2">
          <Plus className="h-4 w-4" />
          New Event
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Drafts", value: draftCount, color: "text-muted-foreground" },
          { label: "Pending Approval", value: pendingCount, color: "text-primary" },
          { label: "Approved", value: approvedCount, color: "text-green-600" },
          { label: "Published", value: publishedCount, color: "text-blue-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl bg-card border border-border p-4">
            <p className={`text-2xl font-semibold ${color}`}>{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Workflow hint */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Event Workflow</h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
          <StatusBadge status="DRAFT" />
          <span>→</span>
          <span className="text-xs text-muted-foreground">Submit for Approval</span>
          <span>→</span>
          <StatusBadge status="PENDING_APPROVAL" />
          <span>→</span>
          <span className="text-xs text-muted-foreground">Coordinator reviews</span>
          <span>→</span>
          <StatusBadge status="APPROVED" />
          <span>→</span>
          <span className="text-xs text-muted-foreground">Publish</span>
          <span>→</span>
          <StatusBadge status="PUBLISHED" />
        </div>
      </div>

      {/* Event list */}
      {loading ? (
        <div className="text-center text-sm text-muted-foreground py-12">Loading your events…</div>
      ) : events.length === 0 ? (
        <div className="text-center text-sm text-muted-foreground py-12">
          You have no events yet.{" "}
          <button
            className="text-primary hover:underline font-medium"
            onClick={() => router.push("/dashboard/events/create")}
          >
            Create your first event
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="rounded-xl bg-card border border-border p-5 space-y-3"
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-foreground">{event.title}</h3>
                    <StatusBadge status={event.status} />
                    {event.categoryName && (
                      <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                        {event.categoryName}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground flex-wrap">
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
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => router.push(`/dashboard/events/${event.id}`)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View
                  </Button>

                  {(event.status === "DRAFT") && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => router.push(`/dashboard/events/${event.id}/edit`)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                  )}

                  {event.status === "DRAFT" && (
                    <Button
                      size="sm"
                      className="gap-1.5"
                      disabled={submitting === event.id}
                      onClick={() => handleSubmitForApproval(event.id)}
                    >
                      <Send className="h-3.5 w-3.5" />
                      {submitting === event.id ? "Submitting…" : "Submit for Approval"}
                    </Button>
                  )}

                  {event.status === "APPROVED" && (
                    <Button
                      size="sm"
                      className="gap-1.5 bg-green-600 hover:bg-green-700"
                      disabled={publishing === event.id}
                      onClick={() => handlePublish(event.id)}
                    >
                      {publishing === event.id ? "Publishing…" : "Publish"}
                    </Button>
                  )}
                </div>
              </div>

              {event.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">{event.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
