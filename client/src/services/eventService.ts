import { httpClient } from "@/external/httpClient";
import type { EventResponseData } from "@/schemas/events";

export async function getCatalogEvents(token?: string) {
  return httpClient<EventResponseData[]>("GET", "/api/events/catalog", undefined, token);
}

export async function getEventById(id: string, token?: string) {
  return httpClient<EventResponseData>("GET", `/api/events/${id}`, undefined, token);
}

export async function getAllEvents(token: string) {
  return httpClient<EventResponseData[]>("GET", "/api/events", undefined, token);
}

export async function cancelEvent(id: string, token: string) {
  return httpClient<void>("POST", `/api/events/${id}/cancel`, undefined, token);
}
