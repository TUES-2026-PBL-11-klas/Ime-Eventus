import { motion } from "framer-motion";
import { Calendar, Users, CheckCircle2, Clock, AlertTriangle, TrendingUp, BarChart3 } from "lucide-react";

const pendingApprovals = [
  { title: "Annual Sports Day", organizer: "Coach Davis", date: "Apr 05", category: "Celebration", submittedAt: "Mar 12" },
  { title: "Art Exhibition", organizer: "Ms. Rivera", date: "Apr 18", category: "Workshop", submittedAt: "Mar 14" },
  { title: "Coding Bootcamp", organizer: "Dr. Kim", date: "Apr 22", category: "Workshop", submittedAt: "Mar 15" },
];

const recentActivity = [
  { action: "Approved", event: "Spring Science Fair", by: "You", time: "2 hours ago" },
  { action: "Rejected", event: "Movie Night", by: "You", time: "Yesterday", reason: "Budget not approved" },
  { action: "Approved", event: "Robotics Club Meetup", by: "You", time: "2 days ago" },
  { action: "Approved", event: "Creative Writing Workshop", by: "Principal Harris", time: "3 days ago" },
];

const participationByGrade = [
  { grade: "Grade 9", participation: 78 },
  { grade: "Grade 10", participation: 85 },
  { grade: "Grade 11", participation: 62 },
  { grade: "Grade 12", participation: 91 },
];

export function CoordinatorDashboardView() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground leading-tight">Coordinator Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Monitor school activities and manage approvals</p>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Pending Approvals", value: 3, icon: Clock, color: "text-warning" },
          { label: "Active Events", value: 12, icon: Calendar, color: "text-primary" },
          { label: "Total Participants", value: 342, icon: Users, color: "text-success" },
          { label: "Avg. Attendance", value: "87%", icon: TrendingUp, color: "text-accent" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-xl bg-card elevation-1 p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={`h-4 w-4 ${s.color}`} />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Pending Approvals */}
        <div className="col-span-7 rounded-xl bg-card elevation-1 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <h3 className="text-sm font-semibold text-foreground">Pending Approvals</h3>
            </div>
            <span className="text-xs font-medium text-warning bg-warning/10 px-2 py-0.5 rounded-full">{pendingApprovals.length} pending</span>
          </div>
          <div className="divide-y divide-border">
            {pendingApprovals.map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.organizer} · {item.category} · {item.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="h-8 px-3 rounded-lg bg-success/10 text-xs font-medium text-success hover:bg-success/20 transition-colors">Approve</button>
                  <button className="h-8 px-3 rounded-lg bg-destructive/10 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors">Reject</button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Participation by Grade */}
        <div className="col-span-5 rounded-xl bg-card elevation-1 p-5">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Participation by Grade</h3>
          </div>
          <div className="space-y-4">
            {participationByGrade.map((item, i) => (
              <motion.div key={item.grade} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium text-foreground">{item.grade}</span>
                  <span className="text-muted-foreground">{item.participation}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${item.participation}%` }} transition={{ delay: i * 0.05 + 0.2, duration: 0.5 }} className="h-full bg-primary rounded-full" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl bg-card elevation-1 overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Recent Approval Activity</h3>
        </div>
        <div className="divide-y divide-border">
          {recentActivity.map((item, i) => (
            <motion.div key={`${item.event}-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-3">
                <span className={`flex h-7 w-7 items-center justify-center rounded-full ${item.action === "Approved" ? "bg-success/10" : "bg-destructive/10"}`}>
                  {item.action === "Approved" ? <CheckCircle2 className="h-3.5 w-3.5 text-success" /> : <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
                </span>
                <div>
                  <p className="text-sm text-foreground"><span className="font-medium">{item.action}</span> — {item.event}</p>
                  {item.reason && <p className="text-xs text-muted-foreground">Reason: {item.reason}</p>}
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{item.time}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
