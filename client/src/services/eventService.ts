import { httpClient } from "@/external/httpClient";
import type { EventResponseData, EventRequestData } from "@/schemas/events";

export async function getCatalogEvents(token?: string) {
  return httpClient<EventResponseData[]>("GET", "/api/events/catalog", undefined, token);
}

export async function getEventById(id: string, token?: string) {
  return httpClient<EventResponseData>("GET", `/api/events/${id}`, undefined, token);
}

export async function getAllEvents(token: string) {
  return httpClient<EventResponseData[]>("GET", "/api/events", undefined, token);
}

export async function getMyEvents(token: string) {
  return httpClient<EventResponseData[]>("GET", "/api/events/my", undefined, token);
}

export async function createEvent(token: string, data: EventRequestData) {
  return httpClient<EventResponseData>("POST", "/api/events", data, token);
}

export async function updateEvent(token: string, id: string, data: EventRequestData) {
  return httpClient<EventResponseData>("PUT", `/api/events/${id}`, data, token);
}

export async function publishEvent(token: string, id: string) {
  return httpClient<EventResponseData>("POST", `/api/events/${id}/publish`, undefined, token);
}

export async function cancelEvent(id: string, token: string) {
  return httpClient<void>("POST", `/api/events/${id}/cancel`, undefined, token);
}
