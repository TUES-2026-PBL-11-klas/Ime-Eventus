import { StatsGrid } from "@/components/StatsGrid";
import { TodaySchedule } from "@/components/TodaySchedule";
import { ApprovalQueue } from "@/components/ApprovalQueue";
import { EventCard, type EventCardData } from "@/components/EventCard";
import { Search, Plus, Filter } from "lucide-react";

const upcomingEvents: EventCardData[] = [
  { id: "1", title: "Spring Science Fair", category: "Competition", categoryColor: "primary", status: "published", date: "Mar 22", time: "09:00–15:00", location: "Main Hall", organizer: "Mr. Thompson", currentCapacity: 45, totalCapacity: 60 },
  { id: "2", title: "Creative Writing Workshop", category: "Workshop", categoryColor: "accent", status: "published", date: "Mar 24", time: "14:00–16:00", location: "Library", organizer: "Ms. Rivera", currentCapacity: 18, totalCapacity: 20 },
  { id: "3", title: "Robotics Club Meetup", category: "Club", categoryColor: "success", status: "approved", date: "Mar 25", time: "15:30–17:00", location: "Lab 204", organizer: "Dr. Kim", currentCapacity: 12, totalCapacity: 25 },
  { id: "4", title: "Annual Sports Day", category: "Celebration", categoryColor: "warning", status: "pending", date: "Apr 05", time: "08:00–17:00", location: "Sports Field", organizer: "Coach Davis", currentCapacity: 180, totalCapacity: 200 },
];

export function DashboardView() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground leading-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Coordinate your school's next big moment.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search events..."
              className="h-9 w-64 rounded-lg border border-border bg-card pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
            />
          </div>
          <button className="flex items-center gap-2 h-9 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:-translate-y-px">
            <Plus className="h-4 w-4" />
            New Event
          </button>
        </div>
      </div>

      {/* Stats */}
      <StatsGrid />

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Schedule */}
        <div className="col-span-5">
          <TodaySchedule />
        </div>

        {/* Approvals */}
        <div className="col-span-7">
          <ApprovalQueue />
        </div>
      </div>

      {/* Upcoming Events */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Upcoming Events</h2>
          <button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
            <Filter className="h-3.5 w-3.5" />
            Filter
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {upcomingEvents.map((event, i) => (
            <EventCard key={event.id} event={event} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
