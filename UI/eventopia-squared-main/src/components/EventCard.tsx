import { StatusBadge } from "./StatusBadge";
import { CapacityBar } from "./CapacityBar";
import { Calendar, MapPin, Clock, User } from "lucide-react";
import { motion } from "framer-motion";

export interface EventCardData {
  id: string;
  title: string;
  category: string;
  categoryColor: "primary" | "accent" | "warning" | "success";
  status: "draft" | "pending" | "approved" | "published" | "completed" | "cancelled" | "conflict" | "fully-booked";
  date: string;
  time: string;
  location: string;
  organizer: string;
  currentCapacity: number;
  totalCapacity: number;
}

interface EventCardProps {
  event: EventCardData;
  index?: number;
}

const categoryColors: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/10 text-accent",
  warning: "bg-warning/10 text-warning",
  success: "bg-success/10 text-success",
};

export function EventCard({ event, index = 0 }: EventCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="group flex flex-col rounded-xl bg-card elevation-1 hover-elevate p-4 transition-all duration-200 cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${categoryColors[event.categoryColor]}`}>
            {event.category}
          </span>
          <StatusBadge status={event.status} />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-foreground mb-3 leading-tight group-hover:text-primary transition-colors duration-200">
        {event.title}
      </h3>

      {/* Metadata Grid */}
      <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          <span>{event.date}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span>{event.time}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span>{event.location}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <User className="h-3.5 w-3.5 shrink-0" />
          <span>{event.organizer}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-3 border-t border-border">
        <CapacityBar current={event.currentCapacity} total={event.totalCapacity} />
      </div>
    </motion.div>
  );
}
