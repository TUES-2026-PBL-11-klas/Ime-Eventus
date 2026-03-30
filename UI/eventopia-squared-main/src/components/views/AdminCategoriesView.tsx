import { motion } from "framer-motion";
import { Tag, Plus, Edit2, Trash2 } from "lucide-react";

interface Category {
  name: string;
  color: string;
  eventCount: number;
  description: string;
}

const categories: Category[] = [
  { name: "Competition", color: "bg-primary", eventCount: 8, description: "Academic and sport competitions" },
  { name: "Workshop", color: "bg-accent", eventCount: 12, description: "Hands-on learning sessions" },
  { name: "Club", color: "bg-success", eventCount: 15, description: "Regular club meetings and activities" },
  { name: "Celebration", color: "bg-warning", eventCount: 4, description: "School-wide celebrations and events" },
  { name: "Volunteer", color: "bg-destructive", eventCount: 6, description: "Community service and volunteer work" },
  { name: "Excursion", color: "bg-primary", eventCount: 3, description: "Field trips and educational visits" },
];

export function AdminCategoriesView() {
  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground leading-tight">Categories</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage event categories and types</p>
        </div>
        <button className="flex items-center gap-2 h-9 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all hover:-translate-y-px">
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {categories.map((cat, i) => (
          <motion.div key={cat.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-xl bg-card elevation-1 p-5 hover-elevate transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg ${cat.color} flex items-center justify-center`}>
                  <Tag className="h-5 w-5 text-card" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{cat.name}</h3>
                  <p className="text-xs text-muted-foreground">{cat.eventCount} events</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1.5 rounded-lg hover:bg-secondary transition-colors"><Edit2 className="h-3.5 w-3.5 text-muted-foreground" /></button>
                <button className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"><Trash2 className="h-3.5 w-3.5 text-destructive" /></button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">{cat.description}</p>
            <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
              <div className={`h-full rounded-full ${cat.color}`} style={{ width: `${(cat.eventCount / 20) * 100}%` }} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
