"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/client/state/auth";
import { useRouter, useParams } from "next/navigation";
import * as eventService from "@/services/eventService";
import * as registrationService from "@/services/registrationService";
import type { EventResponseData, RegistrationResponseData, WaitlistEntryResponseData } from "@/schemas/events";
import { Calendar, Clock, Users, MapPin, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  PENDING_APPROVAL: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-blue-100 text-blue-700",
  PUBLISHED: "bg-green-100 text-green-700",
  COMPLETED: "bg-purple-100 text-purple-700",
  CANCELLED: "bg-red-100 text-red-700",
  FULLY_BOOKED: "bg-gray-100 text-gray-600",
};

function formatDateTime(dt: string) {
  return new Date(dt).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function EventDetailPage() {
  const { token, hasRole } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [event, setEvent] = useState<EventResponseData | null>(null);
  const [registrations, setRegistrations] = useState<RegistrationResponseData[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntryResponseData[]>([]);
  const [myReg, setMyReg] = useState<RegistrationResponseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isStudent = hasRole("STUDENT");
  const isOrganizer = hasRole("TEACHER") || hasRole("COORDINATOR") || hasRole("ADMIN");

  const fetchData = useCallback(async () => {
    if (!token || !id) return;
    setLoading(true);

    const [eventRes, regRes] = await Promise.all([
      eventService.getEventById(id, token),
      isOrganizer ? registrationService.getEventRegistrations(id, token) : Promise.resolve(null),
    ]);

    if (eventRes.success) setEvent(eventRes.data);
    if (regRes && regRes.success) setRegistrations(regRes.data);

    if (isStudent) {
      const myRegRes = await registrationService.getMyRegistrations(token);
      if (myRegRes.success) {
        const found = myRegRes.data.find((r) => r.eventId === id && r.status !== "CANCELLED");
        setMyReg(found ?? null);
      }
    }

    if (isOrganizer) {
      const wlRes = await registrationService.getEventWaitlist(id, token);
      if (wlRes.success) setWaitlist(wlRes.data);
    }

    setLoading(false);
  }, [token, id, isStudent, isOrganizer]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRegister = async () => {
    if (!token) return;
    setError(null);
    setActionLoading(true);
    const res = await registrationService.registerForEvent(id, token);
    if (!res.success) setError(res.error);
    else await fetchData();
    setActionLoading(false);
  };

  const handleCancel = async () => {
    if (!token) return;
    setError(null);
    setActionLoading(true);
    const res = await registrationService.cancelRegistration(id, token);
    if (!res.success) setError(res.error);
    else await fetchData();
    setActionLoading(false);
  };

  const handlePromote = async (entryId: string) => {
    if (!token) return;
    setError(null);
    const res = await registrationService.promoteFromWaitlist(id, entryId, token);
    if (!res.success) setError(res.error);
    else await fetchData();
  };

  const deadlinePassed =
    event?.registrationDeadlineAt != null &&
    new Date(event.registrationDeadlineAt) < new Date();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">Event not found.</p>
      </div>
    );
  }

  const confirmedCount = registrations.filter((r) => r.status === "CONFIRMED").length;

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <h1 className="text-2xl font-semibold text-foreground leading-tight flex-1">{event.title}</h1>
          <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[event.status] ?? "bg-gray-100 text-gray-600"}`}>
            {event.status.replace(/_/g, " ")}
          </span>
        </div>
        {event.categoryName && (
          <span className="inline-block text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
            {event.categoryName}
          </span>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Details card */}
      <div className="rounded-xl bg-card border border-border p-5 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>{formatDateTime(event.startAt)}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4 shrink-0" />
            <span>Ends {formatDateTime(event.endAt)}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4 shrink-0" />
            <span>
              {isOrganizer ? `${confirmedCount} / ${event.capacity}` : `${event.capacity}`} seats
              {event.allowWaitlist && " · waitlist enabled"}
            </span>
          </div>
          {event.roomName && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>{event.roomName}</span>
            </div>
          )}
        </div>
        {event.description && (
          <p className="text-sm text-foreground pt-2 border-t border-border">{event.description}</p>
        )}
        <p className="text-xs text-muted-foreground">Organizer: {event.organizerName}</p>
        {event.registrationDeadlineAt && (
          <p className={`text-xs ${deadlinePassed ? "text-destructive" : "text-muted-foreground"}`}>
            Registration deadline: {formatDateTime(event.registrationDeadlineAt)}
            {deadlinePassed && " (closed)"}
          </p>
        )}
      </div>

      {/* Student actions */}
      {isStudent && (
        <div className="rounded-xl bg-card border border-border p-5 space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Your Registration</h2>
          {myReg ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>
                  Status: <strong>{myReg.status === "CONFIRMED" ? "Confirmed" : "Waitlisted"}</strong>
                  {myReg.status === "WAITLISTED" && " — waiting for a spot"}
                </span>
              </div>
              {!deadlinePassed && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:bg-destructive/10 text-xs"
                  disabled={actionLoading}
                  onClick={handleCancel}
                >
                  {actionLoading ? "Cancelling…" : "Cancel Registration"}
                </Button>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {deadlinePassed ? "Registration is closed." : "You are not registered for this event."}
              </p>
              {!deadlinePassed && (
                <Button size="sm" disabled={actionLoading} onClick={handleRegister}>
                  {actionLoading ? "Registering…" : "Register"}
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Organizer: Registrations */}
      {isOrganizer && (
        <div className="rounded-xl bg-card border border-border p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Registrations ({confirmedCount}/{event.capacity})
            </h2>
            <Button
              size="sm"
              variant="ghost"
              className="text-xs"
              onClick={() => router.push(`/dashboard/events/${id}/attendance`)}
            >
              Mark Attendance
            </Button>
          </div>

          {registrations.length === 0 ? (
            <p className="text-xs text-muted-foreground">No registrations yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {registrations.map((r) => (
                <div key={r.id} className="py-2 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground">{r.studentName}</p>
                    <p className="text-xs text-muted-foreground">{new Date(r.registeredAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    r.status === "CONFIRMED" ? "bg-green-100 text-green-700" :
                    r.status === "WAITLISTED" ? "bg-yellow-100 text-yellow-700" :
                    "bg-gray-100 text-gray-500"
                  }`}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Organizer: Waitlist */}
      {isOrganizer && waitlist.length > 0 && (
        <div className="rounded-xl bg-card border border-border p-5 space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Waitlist ({waitlist.length})
          </h2>
          <div className="divide-y divide-border">
            {waitlist.map((entry) => (
              <div key={entry.id} className="py-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-muted-foreground w-5">#{entry.position}</span>
                  <div>
                    <p className="text-sm text-foreground">{entry.studentName}</p>
                    <p className="text-xs text-muted-foreground">Joined {new Date(entry.joinedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs h-7"
                  onClick={() => handlePromote(entry.id)}
                >
                  Promote
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
