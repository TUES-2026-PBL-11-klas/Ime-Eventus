import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      status: {
        draft: "bg-muted text-muted-foreground",
        pending: "bg-primary/10 text-primary",
        approved: "bg-success/10 text-success",
        conflict: "bg-destructive/10 text-destructive",
        published: "bg-primary text-primary-foreground",
        cancelled: "bg-muted text-muted-foreground line-through",
        completed: "bg-success text-success-foreground",
        "fully-booked": "bg-warning/10 text-warning",
      },
    },
    defaultVariants: {
      status: "draft",
    },
  }
);

const statusLabels: Record<string, string> = {
  draft: "Draft",
  pending: "Pending Approval",
  approved: "Approved",
  conflict: "Conflict Detected",
  published: "Published",
  cancelled: "Cancelled",
  completed: "Completed",
  "fully-booked": "Fully Booked",
};

interface StatusBadgeProps extends VariantProps<typeof statusBadgeVariants> {
  className?: string;
  label?: string;
}

export function StatusBadge({ status, className, label }: StatusBadgeProps) {
  return (
    <span className={cn(statusBadgeVariants({ status }), className)}>
      {label || statusLabels[status || "draft"]}
    </span>
  );
}
