import { motion } from "framer-motion";
import { Award, Calendar, CheckCircle2, XCircle, TrendingUp } from "lucide-react";

interface ParticipationRecord {
  event: string;
  date: string;
  category: string;
  attended: boolean;
}

const records: ParticipationRecord[] = [
  { event: "Winter Science Olympiad", date: "Jan 15", category: "Competition", attended: true },
  { event: "Book Club Meeting", date: "Jan 22", category: "Club", attended: true },
  { event: "Art Workshop", date: "Feb 05", category: "Workshop", attended: false },
  { event: "Community Service Day", date: "Feb 14", category: "Volunteer", attended: true },
  { event: "Math League Finals", date: "Feb 28", category: "Competition", attended: true },
  { event: "Music Appreciation", date: "Mar 05", category: "Workshop", attended: true },
  { event: "Chess Tournament", date: "Mar 10", category: "Competition", attended: true },
];

export function StudentParticipationView() {
  const attended = records.filter(r => r.attended).length;
  const total = records.length;
  const rate = Math.round((attended / total) * 100);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground leading-tight">My Participation</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Your activity history and attendance record</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Events Attended", value: attended, icon: CheckCircle2, color: "text-success" },
          { label: "Total Registered", value: total, icon: Calendar, color: "text-primary" },
          { label: "Attendance Rate", value: `${rate}%`, icon: TrendingUp, color: "text-accent" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-xl bg-card elevation-1 p-5">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={`h-4 w-4 ${s.color}`} />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Badges */}
      <div className="rounded-xl bg-card elevation-1 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Award className="h-4 w-4 text-warning" />
          <h3 className="text-sm font-semibold text-foreground">Achievements</h3>
        </div>
        <div className="flex gap-3">
          {[
            { label: "Active Learner", desc: "5+ events attended", emoji: "🎓" },
            { label: "Team Player", desc: "Joined a volunteer event", emoji: "🤝" },
            { label: "Competitor", desc: "3 competitions entered", emoji: "🏆" },
          ].map((badge, i) => (
            <motion.div key={badge.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} className="flex-1 rounded-lg bg-secondary p-3 text-center">
              <span className="text-2xl">{badge.emoji}</span>
              <p className="text-xs font-semibold text-foreground mt-1.5">{badge.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{badge.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* History */}
      <div className="rounded-xl bg-card elevation-1 overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Attendance History</h3>
        </div>
        <div className="divide-y divide-border">
          {records.map((rec, i) => (
            <motion.div key={rec.event} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">{rec.event}</p>
                <p className="text-xs text-muted-foreground">{rec.date} · {rec.category}</p>
              </div>
              {rec.attended ? (
                <span className="flex items-center gap-1 text-xs font-medium text-success"><CheckCircle2 className="h-3.5 w-3.5" />Attended</span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-medium text-destructive"><XCircle className="h-3.5 w-3.5" />Missed</span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
