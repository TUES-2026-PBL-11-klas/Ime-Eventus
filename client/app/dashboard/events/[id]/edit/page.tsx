"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/client/state/auth";
import { useRouter, useParams } from "next/navigation";
import * as eventService from "@/services/eventService";
import * as categoryService from "@/services/categoryService";
import { EventCreateEditForm } from "@/components/EventCreateEditForm";
import type { EventCreateEditFormData, EventResponseData, EventRequestData } from "@/schemas/events";

interface Category {
  id: string;
  name: string;
}

export default function EditEventPage() {
  const { token, hasRole, user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<EventResponseData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasRole("TEACHER") && !hasRole("COORDINATOR") && !hasRole("ADMIN")) {
      router.replace("/dashboard");
    }
  }, [hasRole, router]);

  const fetchData = useCallback(async () => {
    if (!token || !eventId) return;
    setPageLoading(true);
    try {
      const [eventRes, categoriesRes] = await Promise.all([
        eventService.getEventById(eventId, token),
        categoryService.getAllCategories(token),
      ]);
      if (eventRes.success) setEvent(eventRes.data);
      if (categoriesRes.success) setCategories(categoriesRes.data);
    } finally {
      setPageLoading(false);
    }
  }, [token, eventId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (data: EventRequestData) => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await eventService.updateEvent(token, eventId, data);
      if (res.success) {
        router.push(`/dashboard/events/${eventId}`);
      } else {
        setError("Failed to update event. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="p-6">
        <div className="text-center text-sm text-muted-foreground py-12">Loading event...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-6">
        <div className="text-center text-sm text-muted-foreground py-12">Event not found.</div>
      </div>
    );
  }

  const initialData: EventCreateEditFormData = {
    title: event.title,
    description: event.description || "",
    categoryId: event.categoryId || "",
    roomId: event.roomId || "",
    startAt: event.startAt,
    endAt: event.endAt,
    capacity: event.capacity,
    allowWaitlist: event.allowWaitlist,
    registrationDeadlineAt: event.registrationDeadlineAt || "",
  };

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-foreground leading-tight">Edit Event</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Update event details</p>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 text-destructive text-sm px-4 py-3">
          {error}
        </div>
      )}

      <div className="max-w-2xl">
        <EventCreateEditForm
          initialData={initialData}
          onSubmit={handleSubmit}
          isLoading={loading}
          categories={categories}
          rooms={[]}
          currentUserId={user?.id || ""}
          defaultStatus={event.status}
        />
      </div>
    </div>
  );
}
