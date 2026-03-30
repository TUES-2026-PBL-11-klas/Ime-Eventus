import { motion } from "framer-motion";
import { Calendar, Users, MapPin, AlertTriangle, TrendingUp, Clock } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  index?: number;
}

function StatCard({ label, value, change, icon, trend, index = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="rounded-xl bg-card elevation-1 p-4 hover-elevate transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        {change && (
          <span className={`text-xs font-medium ${trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "text-muted-foreground"}`}>
            {change}
          </span>
        )}
      </div>
      <p className="text-2xl font-semibold text-foreground leading-tight">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </motion.div>
  );
}

export function StatsGrid() {
  const stats: StatCardProps[] = [
    { label: "Active Events", value: "24", change: "+3 this week", icon: <Calendar className="h-4 w-4" />, trend: "up" },
    { label: "Total Registrations", value: "1,247", change: "+12%", icon: <Users className="h-4 w-4" />, trend: "up" },
    { label: "Rooms Booked", value: "18/22", change: "82% utilized", icon: <MapPin className="h-4 w-4" />, trend: "neutral" },
    { label: "Conflicts", value: "2", change: "Needs attention", icon: <AlertTriangle className="h-4 w-4" />, trend: "down" },
    { label: "Avg. Attendance", value: "87%", change: "+5%", icon: <TrendingUp className="h-4 w-4" />, trend: "up" },
    { label: "Upcoming Today", value: "6", change: "Next in 45m", icon: <Clock className="h-4 w-4" />, trend: "neutral" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map((stat, i) => (
        <StatCard key={stat.label} {...stat} index={i} />
      ))}
    </div>
  );
}
