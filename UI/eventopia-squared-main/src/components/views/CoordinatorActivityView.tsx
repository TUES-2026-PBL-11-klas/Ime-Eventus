import { motion } from "framer-motion";
import { Calendar, Users, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface ActivityStat {
  month: string;
  events: number;
  participants: number;
  attendance: number;
}

const monthlyStats: ActivityStat[] = [
  { month: "September", events: 8, participants: 210, attendance: 82 },
  { month: "October", events: 10, participants: 285, attendance: 79 },
  { month: "November", events: 7, participants: 190, attendance: 85 },
  { month: "December", events: 5, participants: 320, attendance: 91 },
  { month: "January", events: 6, participants: 175, attendance: 88 },
  { month: "February", events: 9, participants: 240, attendance: 84 },
  { month: "March", events: 12, participants: 342, attendance: 87 },
];

const departmentActivity = [
  { dept: "Science", events: 12, trend: "up" as const },
  { dept: "Arts", events: 9, trend: "up" as const },
  { dept: "Sports", events: 8, trend: "down" as const },
  { dept: "Technology", events: 7, trend: "up" as const },
  { dept: "Languages", events: 5, trend: "down" as const },
  { dept: "Social Studies", events: 4, trend: "up" as const },
];

const maxEvents = Math.max(...monthlyStats.map(s => s.events));

export function CoordinatorActivityView() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground leading-tight">Activity Monitor</h1>
        <p className="text-sm text-muted-foreground mt-0.5">School-wide event activity and participation trends</p>
      </div>

      {/* Monthly trend chart */}
      <div className="rounded-xl bg-card elevation-1 p-5">
        <h3 className="text-sm font-semibold text-foreground mb-5">Monthly Event Activity</h3>
        <div className="flex items-end gap-3 h-40">
          {monthlyStats.map((stat, i) => (
            <motion.div key={stat.month} className="flex-1 flex flex-col items-center gap-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <span className="text-xs font-medium text-foreground">{stat.events}</span>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(stat.events / maxEvents) * 100}%` }}
                transition={{ delay: i * 0.05 + 0.2, duration: 0.5 }}
                className="w-full bg-primary rounded-t-md min-h-[4px]"
              />
              <span className="text-[10px] text-muted-foreground">{stat.month.slice(0, 3)}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Monthly breakdown table */}
        <div className="col-span-7 rounded-xl bg-card elevation-1 overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Monthly Breakdown</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Month</th>
                <th className="px-5 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Events</th>
                <th className="px-5 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Participants</th>
                <th className="px-5 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Attendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {monthlyStats.map((stat, i) => (
                <motion.tr key={stat.month} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-5 py-2.5 text-sm font-medium text-foreground">{stat.month}</td>
                  <td className="px-5 py-2.5 text-sm text-muted-foreground">{stat.events}</td>
                  <td className="px-5 py-2.5 text-sm text-muted-foreground">{stat.participants}</td>
                  <td className="px-5 py-2.5 text-sm font-medium text-success">{stat.attendance}%</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Department activity */}
        <div className="col-span-5 rounded-xl bg-card elevation-1 overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Department Activity</h3>
          </div>
          <div className="divide-y divide-border">
            {departmentActivity.map((dept, i) => (
              <motion.div key={dept.dept} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="flex items-center justify-between px-5 py-3">
                <span className="text-sm font-medium text-foreground">{dept.dept}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">{dept.events} events</span>
                  {dept.trend === "up" ? (
                    <ArrowUpRight className="h-4 w-4 text-success" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-destructive" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
