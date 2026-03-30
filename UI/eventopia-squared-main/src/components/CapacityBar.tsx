import { cn } from "@/lib/utils";

interface CapacityBarProps {
  current: number;
  total: number;
  className?: string;
}

export function CapacityBar({ current, total, className }: CapacityBarProps) {
  const percentage = Math.round((current / total) * 100);
  const isHigh = percentage >= 80;
  const isFull = percentage >= 100;

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{current}/{total} spots</span>
        <span>{isFull ? "Full" : `${percentage}%`}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            isFull ? "bg-destructive" : isHigh ? "bg-warning" : "bg-success"
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}
