import { motion } from "framer-motion";
import { StatusBadge } from "@/components/StatusBadge";
import { User, Calendar, Clock } from "lucide-react";

interface Registration {
  student: string;
  event: string;
  date: string;
  status: "confirmed" | "waitlisted" | "cancelled";
  registeredAt: string;
}

const registrations: Registration[] = [
  { student: "Alice Johnson", event: "Spring Science Fair", date: "Mar 22", status: "confirmed", registeredAt: "Mar 10" },
  { student: "Bob Smith", event: "Creative Writing Workshop", date: "Mar 24", status: "confirmed", registeredAt: "Mar 11" },
  { student: "Carol Davis", event: "Creative Writing Workshop", date: "Mar 24", status: "waitlisted", registeredAt: "Mar 12" },
  { student: "David Lee", event: "Robotics Club Meetup", date: "Mar 25", status: "confirmed", registeredAt: "Mar 10" },
  { student: "Emma Wilson", event: "Debate Championship", date: "Apr 08", status: "confirmed", registeredAt: "Mar 14" },
  { student: "Frank Brown", event: "Debate Championship", date: "Apr 08", status: "waitlisted", registeredAt: "Mar 15" },
  { student: "Grace Kim", event: "Annual Sports Day", date: "Apr 05", status: "confirmed", registeredAt: "Mar 13" },
  { student: "Henry Park", event: "Volunteer Beach Cleanup", date: "Apr 15", status: "cancelled", registeredAt: "Mar 12" },
];

const statusMap: Record<string, "approved" | "pending" | "cancelled"> = {
  confirmed: "approved",
  waitlisted: "pending",
  cancelled: "cancelled",
};

export function RegistrationsView() {
  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-foreground leading-tight">Registrations</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Track student event registrations</p>
      </div>

      <div className="rounded-xl bg-card elevation-1 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Student</th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Event</th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Event Date</th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Registered</th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {registrations.map((reg, i) => (
              <motion.tr
                key={`${reg.student}-${reg.event}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                className="hover:bg-secondary/50 transition-colors duration-200"
              >
                <td className="px-5 py-3">
                  <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    {reg.student}
                  </span>
                </td>
                <td className="px-5 py-3 text-sm text-foreground">{reg.event}</td>
                <td className="px-5 py-3">
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />{reg.date}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />{reg.registeredAt}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <StatusBadge status={statusMap[reg.status]} label={reg.status.charAt(0).toUpperCase() + reg.status.slice(1)} />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
