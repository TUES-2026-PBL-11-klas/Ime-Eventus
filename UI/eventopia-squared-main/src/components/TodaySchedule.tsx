import { motion } from "framer-motion";
import { Calendar, MapPin, Clock, AlertTriangle } from "lucide-react";

interface ScheduleItem {
  time: string;
  title: string;
  location: string;
  type: "event" | "conflict";
  active?: boolean;
}

const schedule: ScheduleItem[] = [
  { time: "08:00", title: "Morning Assembly", location: "Auditorium", type: "event" },
  { time: "09:30", title: "Art Exhibition Setup", location: "Gallery Wing", type: "event", active: true },
  { time: "11:00", title: "Math Olympiad Prep", location: "Room 301", type: "event" },
  { time: "12:00", title: "Basketball Practice", location: "Gymnasium", type: "conflict" },
  { time: "14:00", title: "Coding Workshop", location: "Computer Lab", type: "event" },
  { time: "15:30", title: "Drama Rehearsal", location: "Theater", type: "event" },
  { time: "16:30", title: "Volunteer Meeting", location: "Room 105", type: "event" },
];

export function TodaySchedule() {
  return (
    <div className="rounded-xl bg-card elevation-1 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Today's Schedule</h3>
        </div>
        <span className="text-xs text-muted-foreground">Mon, Mar 16</span>
      </div>
      <div className="divide-y divide-border">
        {schedule.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
            className={`flex items-center gap-4 px-5 py-3 transition-colors duration-200 cursor-pointer ${
              item.active ? "bg-primary/5 border-l-2 border-l-primary" : "hover:bg-secondary/50"
            } ${item.type === "conflict" ? "bg-destructive/5" : ""}`}
          >
            <span className="text-xs font-medium text-muted-foreground w-12 shrink-0 tabular-nums">
              {item.time}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                {item.type === "conflict" && (
                  <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{item.location}</span>
              </div>
            </div>
            {item.active && (
              <span className="flex items-center gap-1 text-xs font-medium text-primary">
                <Clock className="h-3 w-3" />
                Now
              </span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
