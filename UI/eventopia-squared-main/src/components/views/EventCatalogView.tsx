import { EventCard, type EventCardData } from "@/components/EventCard";
import { Search, Plus, Filter, Grid3X3, List } from "lucide-react";
import { useState } from "react";

const allEvents: EventCardData[] = [
  { id: "1", title: "Spring Science Fair", category: "Competition", categoryColor: "primary", status: "published", date: "Mar 22", time: "09:00–15:00", location: "Main Hall", organizer: "Mr. Thompson", currentCapacity: 45, totalCapacity: 60 },
  { id: "2", title: "Creative Writing Workshop", category: "Workshop", categoryColor: "accent", status: "published", date: "Mar 24", time: "14:00–16:00", location: "Library", organizer: "Ms. Rivera", currentCapacity: 18, totalCapacity: 20 },
  { id: "3", title: "Robotics Club Meetup", category: "Club", categoryColor: "success", status: "approved", date: "Mar 25", time: "15:30–17:00", location: "Lab 204", organizer: "Dr. Kim", currentCapacity: 12, totalCapacity: 25 },
  { id: "4", title: "Annual Sports Day", category: "Celebration", categoryColor: "warning", status: "pending", date: "Apr 05", time: "08:00–17:00", location: "Sports Field", organizer: "Coach Davis", currentCapacity: 180, totalCapacity: 200 },
  { id: "5", title: "Debate Championship", category: "Competition", categoryColor: "primary", status: "published", date: "Apr 08", time: "10:00–14:00", location: "Auditorium", organizer: "Ms. Patel", currentCapacity: 30, totalCapacity: 30 },
  { id: "6", title: "Photography Club", category: "Club", categoryColor: "success", status: "published", date: "Apr 10", time: "15:00–16:30", location: "Art Room", organizer: "Mr. Lee", currentCapacity: 8, totalCapacity: 15 },
  { id: "7", title: "Open Lessons Day", category: "Workshop", categoryColor: "accent", status: "draft", date: "Apr 12", time: "08:00–13:00", location: "All Classrooms", organizer: "Principal Harris", currentCapacity: 0, totalCapacity: 300 },
  { id: "8", title: "Volunteer Beach Cleanup", category: "Volunteer", categoryColor: "success", status: "approved", date: "Apr 15", time: "07:00–12:00", location: "City Beach", organizer: "Mrs. Chen", currentCapacity: 35, totalCapacity: 50 },
];

const categories = ["All", "Competition", "Workshop", "Club", "Celebration", "Volunteer"];

export function EventCatalogView() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = activeCategory === "All" ? allEvents : allEvents.filter(e => e.category === activeCategory);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground leading-tight">Event Catalog</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{allEvents.length} events across all categories</p>
        </div>
        <button className="flex items-center gap-2 h-9 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:-translate-y-px">
          <Plus className="h-4 w-4" />
          Create Event
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="h-9 w-48 rounded-lg border border-border bg-card pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
            />
          </div>
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button className="p-2 bg-primary/10 text-primary"><Grid3X3 className="h-4 w-4" /></button>
            <button className="p-2 text-muted-foreground hover:bg-secondary"><List className="h-4 w-4" /></button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((event, i) => (
          <EventCard key={event.id} event={event} index={i} />
        ))}
      </div>
    </div>
  );
}
