"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { EventCreateEditFormSchema, EventCreateEditFormData, EventRequestData, EventStatusType } from "@/schemas/events";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface EventCreateEditFormProps {
  initialData?: EventCreateEditFormData;
  onSubmit: (data: EventRequestData) => Promise<void>;
  isLoading?: boolean;
  categories?: Array<{ id: string; name: string }>;
  rooms?: Array<{ id: string; name: string }>;
  currentUserId?: string;
  defaultStatus?: EventStatusType;
}

export function EventCreateEditForm({
  initialData,
  onSubmit,
  isLoading = false,
  categories = [],
  rooms = [],
  currentUserId = "",
  defaultStatus = "DRAFT",
}: EventCreateEditFormProps) {
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [deadlineDateOpen, setDeadlineDateOpen] = useState(false);

  const form = useForm<EventCreateEditFormData>({
    resolver: zodResolver(EventCreateEditFormSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      categoryId: "",
      startAt: "",
      endAt: "",
      capacity: 30,
      allowWaitlist: true,
      registrationDeadlineAt: "",
      roomId: "",
    },
  });

  const handleDateSelect = (date: Date | undefined, fieldName: "startAt" | "endAt" | "registrationDeadlineAt") => {
    if (date) {
      const isoString = date.toISOString();
      form.setValue(fieldName, isoString);
    }
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "PPP");
    } catch {
      return "";
    }
  };

  const formatTimeForDisplay = (dateString: string) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "HH:mm");
    } catch {
      return "";
    }
  };

  const handleFormSubmit = async (formData: EventCreateEditFormData) => {
    // Transform form data to API request format
    const requestData: EventRequestData = {
      title: formData.title,
      description: formData.description || undefined,
      categoryId: formData.categoryId ? formData.categoryId : null,
      roomId: formData.roomId ? formData.roomId : null,
      status: defaultStatus,
      organizerId: currentUserId,
      startAt: formData.startAt,
      endAt: formData.endAt,
      capacity: formData.capacity,
      allowWaitlist: formData.allowWaitlist,
      registrationDeadlineAt: formData.registrationDeadlineAt ? formData.registrationDeadlineAt : null,
    };

    await onSubmit(requestData);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{initialData ? "Edit Event" : "Create Event"}</CardTitle>
        <CardDescription>
          {initialData ? "Update event details" : "Create a new event with all required information"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Title Field */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter event title" {...field} />
                  </FormControl>
                  <FormDescription>The main name of your event</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description Field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter event description" {...field} />
                  </FormControl>
                  <FormDescription>Provide details about what the event is about</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category Field */}
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category (Optional)</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      // Convert sentinel value back to empty string
                      field.onChange(value === "__none__" ? "" : value);
                    }}
                    defaultValue={field.value || "__none__"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="__none__">No category</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Room Field */}
            <FormField
              control={form.control}
              name="roomId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room (Optional)</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      // Convert sentinel value back to empty string
                      field.onChange(value === "__none__" ? "" : value);
                    }}
                    defaultValue={field.value || "__none__"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a room" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="__none__">No specific room</SelectItem>
                      {rooms.map((room) => (
                        <SelectItem key={room.id} value={room.id}>
                          {room.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Where will the event take place?</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Start Date/Time Field */}
            <FormField
              control={form.control}
              name="startAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date & Time</FormLabel>
                  <div className="flex gap-2">
                    <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formatDateForDisplay(field.value) || "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => {
                            handleDateSelect(date, "startAt");
                            setStartDateOpen(false);
                          }}
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                    <Input
                      type="time"
                      value={formatTimeForDisplay(field.value)}
                      onChange={(e) => {
                        if (!field.value) return;
                        const date = new Date(field.value);
                        const [hours, minutes] = e.target.value.split(":");
                        date.setHours(parseInt(hours), parseInt(minutes));
                        field.onChange(date.toISOString());
                      }}
                      className="w-24"
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* End Date/Time Field */}
            <FormField
              control={form.control}
              name="endAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date & Time</FormLabel>
                  <div className="flex gap-2">
                    <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formatDateForDisplay(field.value) || "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => {
                            handleDateSelect(date, "endAt");
                            setEndDateOpen(false);
                          }}
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                    <Input
                      type="time"
                      value={formatTimeForDisplay(field.value)}
                      onChange={(e) => {
                        if (!field.value) return;
                        const date = new Date(field.value);
                        const [hours, minutes] = e.target.value.split(":");
                        date.setHours(parseInt(hours), parseInt(minutes));
                        field.onChange(date.toISOString());
                      }}
                      className="w-24"
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Registration Deadline Field */}
            <FormField
              control={form.control}
              name="registrationDeadlineAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registration Deadline (Optional)</FormLabel>
                  <div className="flex gap-2">
                    <Popover open={deadlineDateOpen} onOpenChange={setDeadlineDateOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formatDateForDisplay(field.value || "") || "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => {
                            handleDateSelect(date, "registrationDeadlineAt");
                            setDeadlineDateOpen(false);
                          }}
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                    <Input
                      type="time"
                      value={formatTimeForDisplay(field.value || "")}
                      onChange={(e) => {
                        if (!field.value) return;
                        const date = new Date(field.value);
                        const [hours, minutes] = e.target.value.split(":");
                        date.setHours(parseInt(hours), parseInt(minutes));
                        field.onChange(date.toISOString());
                      }}
                      className="w-24"
                    />
                  </div>
                  <FormDescription>When should registration close?</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Capacity Field */}
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="Maximum number of participants"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    />
                  </FormControl>
                  <FormDescription>Maximum number of participants allowed</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Waitlist Toggle */}
            <FormField
              control={form.control}
              name="allowWaitlist"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Allow Waitlist</FormLabel>
                    <FormDescription>Allow participants to join a waitlist when event is full</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : initialData ? "Update Event" : "Create Event"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
