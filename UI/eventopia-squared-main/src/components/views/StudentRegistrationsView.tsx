import { motion } from "framer-motion";
import { Calendar, MapPin, Clock, XCircle, CheckCircle2, AlertCircle } from "lucide-react";

interface MyRegistration {
  event: string;
  date: string;
  time: string;
  location: string;
  status: "confirmed" | "waitlisted" | "cancelled";
  registeredAt: string;
  position?: number;
}

const myRegistrations: MyRegistration[] = [
  { event: "Spring Science Fair", date: "Mar 22", time: "09:00–15:00", location: "Main Hall", status: "confirmed", registeredAt: "Mar 10" },
  { event: "Photography Club", date: "Apr 10", time: "15:00–16:30", location: "Art Room", status: "confirmed", registeredAt: "Mar 12" },
  { event: "Debate Championship", date: "Apr 08", time: "10:00–14:00", location: "Auditorium", status: "waitlisted", registeredAt: "Mar 15", position: 3 },
  { event: "Music Festival", date: "Apr 20", time: "18:00–21:00", location: "Gymnasium", status: "cancelled", registeredAt: "Mar 14" },
];

const statusConfig = {
  confirmed: { label: "Confirmed", icon: CheckCircle2, className: "text-success bg-success/10" },
  waitlisted: { label: "Waitlisted", icon: AlertCircle, className: "text-warning bg-warning/10" },
  cancelled: { label: "Cancelled", icon: XCircle, className: "text-destructive bg-destructive/10" },
};

export function StudentRegistrationsView() {
  const active = myRegistrations.filter(r => r.status !== "cancelled");
  const past = myRegistrations.filter(r => r.status === "cancelled");

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground leading-tight">My Registrations</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Track your event sign-ups and participation</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Active", value: active.length, color: "text-success" },
          { label: "Waitlisted", value: myRegistrations.filter(r => r.status === "waitlisted").length, color: "text-warning" },
          { label: "Cancelled", value: past.length, color: "text-destructive" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-xl bg-card elevation-1 p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Registration List */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Upcoming</h2>
        {myRegistrations.filter(r => r.status !== "cancelled").map((reg, i) => {
          const config = statusConfig[reg.status];
          const Icon = config.icon;
          return (
            <motion.div key={reg.event} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-4 rounded-xl bg-card elevation-1 p-4">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground">{reg.event}</h3>
                <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{reg.date}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{reg.time}</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{reg.location}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${config.className}`}>
                  <Icon className="h-3.5 w-3.5" />
                  {config.label}
                  {reg.position && <span>(#{reg.position})</span>}
                </span>
                {reg.status === "confirmed" && (
                  <button className="text-xs text-destructive hover:underline">Cancel</button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {past.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cancelled</h2>
          {past.map((reg, i) => (
            <div key={reg.event} className="flex items-center gap-4 rounded-xl bg-card elevation-1 p-4 opacity-50">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-foreground line-through">{reg.event}</h3>
                <p className="text-xs text-muted-foreground mt-1">{reg.date} · {reg.location}</p>
              </div>
              <span className="text-xs text-destructive">Cancelled</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
