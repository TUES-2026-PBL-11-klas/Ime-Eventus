import { httpClient } from "@/external/httpClient";
import type { AttendanceResponseData, BulkAttendanceInput } from "@/schemas/events";

export async function markAttendance(eventId: string, data: BulkAttendanceInput, token: string) {
  return httpClient<AttendanceResponseData[]>("POST", `/api/events/${eventId}/attendance`, data, token);
}

export async function getEventAttendance(eventId: string, token: string) {
  return httpClient<AttendanceResponseData[]>("GET", `/api/events/${eventId}/attendance`, undefined, token);
}
