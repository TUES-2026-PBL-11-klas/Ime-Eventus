import z from "zod";

// ── Event Schemas ────────────────────────────────────────────

export const EventResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  categoryId: z.string().nullable(),
  categoryName: z.string().nullable(),
  status: z.string(),
  organizerId: z.string(),
  organizerName: z.string(),
  roomId: z.string().nullable(),
  roomName: z.string().nullable(),
  startAt: z.string(),
  endAt: z.string(),
  capacity: z.number(),
  allowWaitlist: z.boolean(),
  registrationDeadlineAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  publishedAt: z.string().nullable(),
  cancelledAt: z.string().nullable(),
});
export type EventResponseData = z.infer<typeof EventResponseSchema>;

// ── Registration Schemas ─────────────────────────────────────

export const RegistrationResponseSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  eventTitle: z.string(),
  eventStartAt: z.string(),
  eventEndAt: z.string(),
  studentId: z.string(),
  studentName: z.string(),
  status: z.enum(["CONFIRMED", "WAITLISTED", "CANCELLED"]),
  registeredAt: z.string(),
  cancelledAt: z.string().nullable(),
  cancellationReason: z.string().nullable(),
});
export type RegistrationResponseData = z.infer<typeof RegistrationResponseSchema>;

export const WaitlistEntryResponseSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  eventTitle: z.string(),
  studentId: z.string(),
  studentName: z.string(),
  position: z.number(),
  joinedAt: z.string(),
  promotedAt: z.string().nullable(),
});
export type WaitlistEntryResponseData = z.infer<typeof WaitlistEntryResponseSchema>;

// ── Attendance Schemas ───────────────────────────────────────

export const AttendanceResponseSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  studentId: z.string(),
  studentName: z.string(),
  status: z.enum(["PRESENT", "ABSENT", "EXCUSED"]),
  markedById: z.string().nullable(),
  markedByName: z.string().nullable(),
  markedAt: z.string(),
  note: z.string().nullable(),
});
export type AttendanceResponseData = z.infer<typeof AttendanceResponseSchema>;

export const AttendanceItemSchema = z.object({
  studentId: z.string(),
  status: z.enum(["PRESENT", "ABSENT", "EXCUSED"]),
  note: z.string().optional(),
});

export const BulkAttendanceSchema = z.object({
  items: z.array(AttendanceItemSchema).min(1),
});
export type BulkAttendanceInput = z.infer<typeof BulkAttendanceSchema>;

// ── Notification Schemas ─────────────────────────────────────

export const NotificationResponseSchema = z.object({
  id: z.string(),
  type: z.string(),
  eventId: z.string().nullable(),
  eventTitle: z.string().nullable(),
  title: z.string(),
  body: z.string(),
  read: z.boolean(),
  createdAt: z.string(),
  readAt: z.string().nullable(),
});
export type NotificationResponseData = z.infer<typeof NotificationResponseSchema>;
