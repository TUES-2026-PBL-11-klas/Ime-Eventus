import { motion } from "framer-motion";
import { BarChart3, Users, Calendar, TrendingUp } from "lucide-react";

const eventsByCategory = [
  { category: "Competition", count: 8, color: "bg-primary" },
  { category: "Workshop", count: 12, color: "bg-accent" },
  { category: "Club", count: 15, color: "bg-success" },
  { category: "Celebration", count: 4, color: "bg-warning" },
  { category: "Volunteer", count: 6, color: "bg-destructive" },
];

const topOrganizers = [
  { name: "Mr. Thompson", events: 8, attendance: "92%" },
  { name: "Ms. Rivera", events: 6, attendance: "88%" },
  { name: "Dr. Kim", events: 5, attendance: "95%" },
  { name: "Coach Davis", events: 4, attendance: "78%" },
  { name: "Mrs. Chen", events: 4, attendance: "91%" },
];

const maxCount = Math.max(...eventsByCategory.map(e => e.count));

export function ReportsView() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground leading-tight">Reports</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Analytics and participation insights</p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Events by Category */}
        <div className="col-span-7 rounded-xl bg-card elevation-1 p-5">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Events by Category</h3>
          </div>
          <div className="space-y-3">
            {eventsByCategory.map((item, i) => (
              <motion.div
                key={item.category}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3"
              >
                <span className="text-xs text-muted-foreground w-24 shrink-0">{item.category}</span>
                <div className="flex-1 h-6 bg-muted rounded overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.count / maxCount) * 100}%` }}
                    transition={{ delay: i * 0.05 + 0.2, duration: 0.5 }}
                    className={`h-full ${item.color} rounded flex items-center justify-end pr-2`}
                  >
                    <span className="text-xs font-medium text-card">{item.count}</span>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Top Organizers */}
        <div className="col-span-5 rounded-xl bg-card elevation-1 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
            <Users className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Top Organizers</h3>
          </div>
          <div className="divide-y divide-border">
            {topOrganizers.map((org, i) => (
              <motion.div
                key={org.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between px-5 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium text-foreground">{org.name}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{org.events}</span>
                  <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" />{org.attendance}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
