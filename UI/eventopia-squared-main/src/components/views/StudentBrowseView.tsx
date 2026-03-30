import { motion } from "framer-motion";
import { Search, Calendar, MapPin, Users, Clock, Heart, CheckCircle2 } from "lucide-react";
import { CapacityBar } from "@/components/CapacityBar";
import { useState } from "react";

interface StudentEvent {
  id: string;
  title: string;
  category: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  current: number;
  total: number;
  registered: boolean;
  waitlisted: boolean;
}

const events: StudentEvent[] = [
  { id: "1", title: "Spring Science Fair", category: "Competition", date: "Mar 22", time: "09:00–15:00", location: "Main Hall", organizer: "Mr. Thompson", current: 45, total: 60, registered: true, waitlisted: false },
  { id: "2", title: "Creative Writing Workshop", category: "Workshop", date: "Mar 24", time: "14:00–16:00", location: "Library", organizer: "Ms. Rivera", current: 20, total: 20, registered: false, waitlisted: false },
  { id: "3", title: "Robotics Club Meetup", category: "Club", date: "Mar 25", time: "15:30–17:00", location: "Lab 204", organizer: "Dr. Kim", current: 12, total: 25, registered: false, waitlisted: false },
  { id: "5", title: "Debate Championship", category: "Competition", date: "Apr 08", time: "10:00–14:00", location: "Auditorium", organizer: "Ms. Patel", current: 30, total: 30, registered: false, waitlisted: true },
  { id: "6", title: "Photography Club", category: "Club", date: "Apr 10", time: "15:00–16:30", location: "Art Room", organizer: "Mr. Lee", current: 8, total: 15, registered: true, waitlisted: false },
  { id: "8", title: "Volunteer Beach Cleanup", category: "Volunteer", date: "Apr 15", time: "07:00–12:00", location: "City Beach", organizer: "Mrs. Chen", current: 35, total: 50, registered: false, waitlisted: false },
];

const categories = ["All", "Competition", "Workshop", "Club", "Volunteer"];

export function StudentBrowseView() {
  const [activeCategory, setActiveCategory] = useState("All");
  const filtered = activeCategory === "All" ? events : events.filter(e => e.category === activeCategory);

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-foreground leading-tight">Browse Events</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Discover and register for upcoming school events</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Search events..." className="h-9 w-full rounded-lg border border-border bg-card pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
        </div>
        <div className="flex items-center gap-1.5">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((event, i) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl bg-card elevation-1 p-5 hover-elevate transition-all duration-200 flex flex-col"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{event.category}</span>
                <h3 className="text-sm font-semibold text-foreground mt-2">{event.title}</h3>
              </div>
              <button className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                <Heart className={`h-4 w-4 ${event.registered ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
              </button>
            </div>

            <div className="space-y-1.5 text-xs text-muted-foreground mb-4 flex-1">
              <div className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{event.date} · {event.time}</div>
              <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{event.location}</div>
              <div className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />by {event.organizer}</div>
            </div>

            <CapacityBar current={event.current} total={event.total} />

            <div className="mt-4">
              {event.registered ? (
                <button className="w-full flex items-center justify-center gap-2 h-9 rounded-lg bg-success/10 text-success text-sm font-medium">
                  <CheckCircle2 className="h-4 w-4" /> Registered
                </button>
              ) : event.waitlisted ? (
                <button className="w-full flex items-center justify-center gap-2 h-9 rounded-lg bg-warning/10 text-warning text-sm font-medium">
                  <Clock className="h-4 w-4" /> On Waitlist
                </button>
              ) : event.current >= event.total ? (
                <button className="w-full h-9 rounded-lg bg-secondary text-sm font-medium text-muted-foreground">
                  Join Waitlist
                </button>
              ) : (
                <button className="w-full h-9 rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                  Register Now
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
