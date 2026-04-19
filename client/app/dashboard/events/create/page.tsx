"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/client/state/auth";
import { useRouter } from "next/navigation";
import * as categoryService from "@/services/categoryService";
import * as eventService from "@/services/eventService";
import { EventCreateEditForm } from "@/components/EventCreateEditForm";
import type { EventRequestData } from "@/schemas/events";

interface Category {
  id: string;
  name: string;
}

export default function CreateEventPage() {
  const { token, hasRole, user } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasRole("TEACHER") && !hasRole("COORDINATOR") && !hasRole("ADMIN")) {
      router.replace("/dashboard");
    }
  }, [hasRole, router]);

  const fetchCategories = useCallback(async () => {
    if (!token) return;
    const res = await categoryService.getAllCategories(token);
    if (res.success) setCategories(res.data);
  }, [token]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleSubmit = async (data: EventRequestData) => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await eventService.createEvent(token, data);
      if (res.success) {
        router.push("/dashboard/my-events");
      } else {
        setError("Failed to create event. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-foreground leading-tight">Create Event</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Create a new event with all details</p>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 text-destructive text-sm px-4 py-3">
          {error}
        </div>
      )}

      <div className="max-w-2xl">
        <EventCreateEditForm
          onSubmit={handleSubmit}
          isLoading={loading}
          categories={categories}
          rooms={[]}
          currentUserId={user?.id || ""}
          defaultStatus="DRAFT"
        />
      </div>
    </div>
  );
}
