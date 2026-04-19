import { httpClient } from "@/external/httpClient";
import type { RegistrationResponseData, WaitlistEntryResponseData } from "@/schemas/events";

export async function registerForEvent(eventId: string, token: string) {
  return httpClient<RegistrationResponseData>("POST", `/api/events/${eventId}/register`, undefined, token);
}

export async function cancelRegistration(eventId: string, token: string, reason?: string) {
  return httpClient<RegistrationResponseData>("DELETE", `/api/events/${eventId}/register`, { reason }, token);
}

export async function getEventRegistrations(eventId: string, token: string) {
  return httpClient<RegistrationResponseData[]>("GET", `/api/events/${eventId}/registrations`, undefined, token);
}

export async function getMyRegistrations(token: string) {
  return httpClient<RegistrationResponseData[]>("GET", "/api/registrations/my", undefined, token);
}

export async function getEventWaitlist(eventId: string, token: string) {
  return httpClient<WaitlistEntryResponseData[]>("GET", `/api/events/${eventId}/waitlist`, undefined, token);
}

export async function promoteFromWaitlist(eventId: string, entryId: string, token: string) {
  return httpClient<RegistrationResponseData>("POST", `/api/events/${eventId}/waitlist/${entryId}/promote`, undefined, token);
}
