"use client";

import { Calendar, Clock, MapPin, User } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { CapacityBar } from "./CapacityBar";
import type { EventResponseData } from "@/schemas/events";

interface EventCardProps {
  event: EventResponseData;
  registrationCount?: number;
  onClick?: () => void;
}

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
}

function formatTime(dt: string) {
  return new Date(dt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export function EventCard({ event, registrationCount = 0, onClick }: EventCardProps) {
  return (
    <div
      onClick={onClick}
      className="group flex flex-col rounded-xl bg-card border border-border hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-4 cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          {event.categoryName && (
            <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary">
              {event.categoryName}
            </span>
          )}
          <StatusBadge status={event.status} />
        </div>
      </div>

      <h3 className="text-base font-semibold text-foreground mb-3 leading-tight group-hover:text-primary transition-colors duration-200">
        {event.title}
      </h3>

      <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          <span>{formatDate(event.startAt)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span>{formatTime(event.startAt)}–{formatTime(event.endAt)}</span>
        </div>
        {event.roomName && (
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{event.roomName}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <User className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{event.organizerName}</span>
        </div>
      </div>

      <div className="mt-auto pt-3 border-t border-border">
        <CapacityBar current={registrationCount} total={event.capacity} />
      </div>
    </div>
  );
}
