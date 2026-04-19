"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/client/state/auth";
import { useRouter } from "next/navigation";
import * as categoryService from "@/services/categoryService";
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

  useEffect(() => {
    if (!hasRole("TEACHER") && !hasRole("COORDINATOR") && !hasRole("ADMIN")) {
      router.replace("/dashboard");
    }
  }, [hasRole, router]);

  const fetchCategories = useCallback(async () => {
    if (!token) return;
    const res = await categoryService.getAllCategories(token);
    if (res.success) {
      setCategories(res.data);
    }
  }, [token]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSubmit = async (data: EventRequestData) => {
    // TODO: Implement API call to create event
    console.log("Creating event:", data);
    // setLoading(true);
    // try {
    //   const res = await eventService.createEvent(token, data);
    //   if (res.success) {
    //     router.push("/dashboard/events");
    //   }
    // } finally {
    //   setLoading(false);
    // }
  };

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-foreground leading-tight">Create Event</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Create a new event with all details</p>
      </div>

      <div className="max-w-2xl">
        <EventCreateEditForm
          onSubmit={handleSubmit}
          isLoading={loading}
          categories={categories}
          rooms={[]} // TODO: Fetch rooms from API
          currentUserId={user?.id || ""}
          defaultStatus="DRAFT"
        />
      </div>
    </div>
  );
}
