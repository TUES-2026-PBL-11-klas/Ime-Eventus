"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/client/state/auth";
import { useRouter, useParams } from "next/navigation";
import * as eventService from "@/services/eventService";
import * as registrationService from "@/services/registrationService";
import * as attendanceService from "@/services/attendanceService";
import type { EventResponseData, RegistrationResponseData, AttendanceResponseData } from "@/schemas/events";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

type AttendanceStatus = "PRESENT" | "ABSENT" | "EXCUSED";

const STATUS_STYLES: Record<AttendanceStatus, string> = {
  PRESENT: "bg-green-100 text-green-700 border-green-200",
  ABSENT: "bg-red-100 text-red-700 border-red-200",
  EXCUSED: "bg-yellow-100 text-yellow-700 border-yellow-200",
};

export default function AttendancePage() {
  const { token, hasRole } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [event, setEvent] = useState<EventResponseData | null>(null);
  const [registrations, setRegistrations] = useState<RegistrationResponseData[]>([]);
  const [existingAttendance, setExistingAttendance] = useState<AttendanceResponseData[]>([]);
  const [marks, setMarks] = useState<Record<string, AttendanceStatus>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!hasRole("TEACHER") && !hasRole("COORDINATOR") && !hasRole("ADMIN")) {
      router.replace("/dashboard");
    }
  }, [hasRole, router]);

  const fetchData = useCallback(async () => {
    if (!token || !id) return;
    setLoading(true);

    const [eventRes, regRes, attRes] = await Promise.all([
      eventService.getEventById(id, token),
      registrationService.getEventRegistrations(id, token),
      attendanceService.getEventAttendance(id, token),
    ]);

    if (eventRes.success) setEvent(eventRes.data);

    const confirmed = regRes.success
      ? regRes.data.filter((r) => r.status === "CONFIRMED")
      : [];
    setRegistrations(confirmed);

    if (attRes.success) {
      setExistingAttendance(attRes.data);
      // Pre-fill marks from existing attendance
      const initialMarks: Record<string, AttendanceStatus> = {};
      const initialNotes: Record<string, string> = {};
      attRes.data.forEach((a) => {
        initialMarks[a.studentId] = a.status;
        initialNotes[a.studentId] = a.note ?? "";
      });
      // Default unmarked confirmed students to PRESENT
      confirmed.forEach((r) => {
        if (!initialMarks[r.studentId]) {
          initialMarks[r.studentId] = "PRESENT";
        }
      });
      setMarks(initialMarks);
      setNotes(initialNotes);
    } else {
      // Default all to PRESENT
      const initialMarks: Record<string, AttendanceStatus> = {};
      confirmed.forEach((r) => { initialMarks[r.studentId] = "PRESENT"; });
      setMarks(initialMarks);
    }

    setLoading(false);
  }, [token, id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    if (!token) return;
    setError(null);
    setSaving(true);
    setSaved(false);

    const items = registrations.map((r) => ({
      studentId: r.studentId,
      status: marks[r.studentId] ?? "ABSENT",
      note: notes[r.studentId] ?? undefined,
    }));

    const res = await attendanceService.markAttendance(id, { items }, token);
    if (!res.success) setError(res.error);
    else { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const presentCount = Object.values(marks).filter((s) => s === "PRESENT").length;
  const absentCount = Object.values(marks).filter((s) => s === "ABSENT").length;
  const excusedCount = Object.values(marks).filter((s) => s === "EXCUSED").length;

  return (
    <div className="p-6 space-y-5 max-w-2xl">
      <button
        onClick={() => router.push(`/dashboard/events/${id}`)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to event
      </button>

      <div>
        <h1 className="text-2xl font-semibold text-foreground leading-tight">Mark Attendance</h1>
        {event && <p className="text-sm text-muted-foreground mt-0.5">{event.title}</p>}
      </div>

      {/* Summary bar */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-green-700 font-medium">{presentCount} Present</span>
        <span className="text-red-700 font-medium">{absentCount} Absent</span>
        <span className="text-yellow-700 font-medium">{excusedCount} Excused</span>
        <span className="text-muted-foreground">/ {registrations.length} total</span>
      </div>

      {/* Quick mark all */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Mark all as:</span>
        {(["PRESENT", "ABSENT", "EXCUSED"] as AttendanceStatus[]).map((s) => (
          <button
            key={s}
            className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${STATUS_STYLES[s]}`}
            onClick={() => {
              const next: Record<string, AttendanceStatus> = {};
              registrations.forEach((r) => { next[r.studentId] = s; });
              setMarks(next);
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {registrations.length === 0 ? (
        <div className="text-center text-sm text-muted-foreground py-12">
          No confirmed registrations for this event.
        </div>
      ) : (
        <div className="rounded-xl bg-card border border-border divide-y divide-border">
          {registrations.map((reg) => {
            const status = marks[reg.studentId] ?? "PRESENT";
            return (
              <div key={reg.studentId} className="px-4 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{reg.studentName}</p>
                </div>
                {/* Status toggle buttons */}
                <div className="flex items-center gap-1">
                  {(["PRESENT", "ABSENT", "EXCUSED"] as AttendanceStatus[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setMarks((prev) => ({ ...prev, [reg.studentId]: s }))}
                      className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-all ${
                        status === s
                          ? STATUS_STYLES[s]
                          : "bg-transparent text-muted-foreground border-border hover:bg-secondary"
                      }`}
                    >
                      {s === "PRESENT" ? "P" : s === "ABSENT" ? "A" : "E"}
                    </button>
                  ))}
                </div>
                <input
                  className="text-xs border border-border rounded-lg px-2 py-1 w-32 bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Note…"
                  value={notes[reg.studentId] ?? ""}
                  onChange={(e) =>
                    setNotes((prev) => ({ ...prev, [reg.studentId]: e.target.value }))
                  }
                />
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving || registrations.length === 0}>
          <Save className="h-4 w-4 mr-1.5" />
          {saving ? "Saving…" : "Save Attendance"}
        </Button>
        {saved && (
          <span className="text-sm text-green-600 font-medium">Attendance saved!</span>
        )}
      </div>
    </div>
  );
}
