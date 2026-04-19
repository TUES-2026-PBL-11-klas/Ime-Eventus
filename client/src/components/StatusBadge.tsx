import { cn } from "@/lib/utils";
import type { EventStatusType } from "@/schemas/events";

const variants: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  PENDING_APPROVAL: "bg-primary/10 text-primary",
  APPROVED: "bg-green-100 text-green-700",
  PUBLISHED: "bg-primary text-primary-foreground",
  COMPLETED: "bg-green-600 text-white",
  CANCELLED: "bg-muted text-muted-foreground line-through",
  CONFLICT: "bg-destructive/10 text-destructive",
  FULLY_BOOKED: "bg-yellow-100 text-yellow-700",
};

const labels: Record<string, string> = {
  DRAFT: "Draft",
  PENDING_APPROVAL: "Pending Approval",
  APPROVED: "Approved",
  PUBLISHED: "Published",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  CONFLICT: "Conflict",
  FULLY_BOOKED: "Fully Booked",
};

interface StatusBadgeProps {
  status: EventStatusType | string;
  className?: string;
  label?: string;
}

export function StatusBadge({ status, className, label }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[status] ?? "bg-muted text-muted-foreground",
        className
      )}
    >
      {label ?? labels[status] ?? status}
    </span>
  );
}
