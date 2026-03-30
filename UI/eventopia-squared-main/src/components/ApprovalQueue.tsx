import { StatusBadge } from "./StatusBadge";
import { Clock, User, MapPin } from "lucide-react";
import { motion } from "framer-motion";

interface ApprovalItem {
  id: string;
  title: string;
  organizer: string;
  date: string;
  location: string;
  submittedAt: string;
}

const pendingApprovals: ApprovalItem[] = [
  { id: "1", title: "Science Fair 2026", organizer: "Mr. Thompson", date: "Apr 15", location: "Main Hall", submittedAt: "2 hours ago" },
  { id: "2", title: "Chess Club Tournament", organizer: "Ms. Rivera", date: "Apr 18", location: "Room 204", submittedAt: "5 hours ago" },
  { id: "3", title: "Parent-Teacher Conference", organizer: "Mrs. Chen", date: "Apr 20", location: "Auditorium", submittedAt: "1 day ago" },
];

export function ApprovalQueue() {
  return (
    <div className="rounded-xl bg-card elevation-1 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Pending Approvals</h3>
          <p className="text-xs text-muted-foreground mt-0.5">3 events waiting for review</p>
        </div>
        <StatusBadge status="pending" label="3 pending" />
      </div>
      <div className="divide-y divide-border">
        {pendingApprovals.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
            className="flex items-center justify-between px-5 py-3 hover:bg-secondary/50 transition-colors duration-200 cursor-pointer"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><User className="h-3 w-3" />{item.organizer}</span>
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{item.location}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{item.date}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <button className="rounded-md bg-success px-3 py-1.5 text-xs font-medium text-success-foreground hover:bg-success/90 transition-colors">
                Approve
              </button>
              <button className="rounded-md bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-muted transition-colors">
                Reject
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
