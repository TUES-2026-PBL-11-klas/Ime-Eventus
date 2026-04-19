import z from "zod";

// ── Event Form Schemas (Client-side only, will be transformed for API) ───

export const EventCreateEditFormSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(255, "Title must not exceed 255 characters"),
  description: z.string()
    .max(10000, "Description must not exceed 10000 characters")
    .optional()
    .or(z.literal("")),
  categoryId: z.string()
    .optional()
    .or(z.literal("")),
  startAt: z.string()
    .min(1, "Start date and time is required"),
  endAt: z.string()
    .min(1, "End date and time is required"),
  capacity: z.number()
    .int("Capacity must be a whole number")
    .min(1, "Capacity must be at least 1"),
  allowWaitlist: z.boolean().default(true),
  registrationDeadlineAt: z.string()
    .optional()
    .or(z.literal("")),
  roomId: z.string()
    .optional()
    .or(z.literal("")),
}).refine(
  (data) => new Date(data.startAt) < new Date(data.endAt),
  {
    message: "End date and time must be after start date and time",
    path: ["endAt"],
  }
).refine(
  (data) => !data.registrationDeadlineAt || new Date(data.registrationDeadlineAt) <= new Date(data.startAt),
  {
    message: "Registration deadline must be before or on the start date",
    path: ["registrationDeadlineAt"],
  }
);

export type EventCreateEditFormData = z.infer<typeof EventCreateEditFormSchema>;

// ── Event API Request Schema (matches EventRequest.java) ───

export const EventStatus = z.enum([
  "DRAFT",
  "PENDING_APPROVAL",
  "APPROVED",
  "PUBLISHED",
  "COMPLETED",
  "CANCELLED",
  "CONFLICT",
  "FULLY_BOOKED",
]);
export type EventStatusType = z.infer<typeof EventStatus>;

export const EventRequestSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .max(255, "Title must not exceed 255 characters"),
  description: z.string()
    .max(10000, "Description must not exceed 10000 characters")
    .optional(),
  categoryId: z.string().uuid().optional().nullable(),
  status: EventStatus,
  organizerId: z.string().uuid("Organizer ID must be a valid UUID"),
  roomId: z.string().uuid().optional().nullable(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  capacity: z.number()
    .int("Capacity must be a whole number")
    .min(1, "Capacity must be at least 1"),
  allowWaitlist: z.boolean().default(true),
  registrationDeadlineAt: z.string().datetime().optional().nullable(),
});
export type EventRequestData = z.infer<typeof EventRequestSchema>;

// ── Event Response Schemas (matches EventResponse.java) ───

export const EventResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  categoryId: z.string().uuid().nullable(),
  categoryName: z.string().nullable(),
  status: EventStatus,
  organizerId: z.string().uuid(),
  organizerName: z.string(),
  roomId: z.string().uuid().nullable(),
  roomName: z.string().nullable(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  capacity: z.number().int(),
  allowWaitlist: z.boolean(),
  registrationDeadlineAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  publishedAt: z.string().datetime().nullable(),
  cancelledAt: z.string().datetime().nullable(),
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
