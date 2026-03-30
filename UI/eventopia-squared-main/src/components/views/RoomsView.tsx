import { motion } from "framer-motion";
import { MapPin, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

interface Room {
  name: string;
  capacity: number;
  status: "available" | "occupied" | "conflict";
  currentEvent?: string;
  nextAvailable?: string;
}

const rooms: Room[] = [
  { name: "Main Hall", capacity: 200, status: "occupied", currentEvent: "Morning Assembly", nextAvailable: "10:00" },
  { name: "Auditorium", capacity: 350, status: "available" },
  { name: "Room 204", capacity: 35, status: "conflict", currentEvent: "Chess Club / Math Tutoring" },
  { name: "Computer Lab", capacity: 30, status: "occupied", currentEvent: "Coding Workshop", nextAvailable: "15:00" },
  { name: "Library", capacity: 50, status: "available" },
  { name: "Gymnasium", capacity: 150, status: "occupied", currentEvent: "Basketball Practice", nextAvailable: "13:00" },
  { name: "Art Room", capacity: 25, status: "available" },
  { name: "Lab 204", capacity: 30, status: "available" },
  { name: "Theater", capacity: 120, status: "occupied", currentEvent: "Drama Rehearsal", nextAvailable: "17:00" },
  { name: "Room 301", capacity: 40, status: "available" },
];

const statusConfig = {
  available: { label: "Available", icon: CheckCircle2, className: "text-success" },
  occupied: { label: "Occupied", icon: Clock, className: "text-warning" },
  conflict: { label: "Conflict", icon: AlertTriangle, className: "text-destructive" },
};

export function RoomsView() {
  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-foreground leading-tight">Rooms & Resources</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage room availability and equipment</p>
      </div>

      <div className="rounded-xl bg-card elevation-1 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Room</th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Capacity</th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Current / Next</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rooms.map((room, i) => {
              const config = statusConfig[room.status];
              const Icon = config.icon;
              return (
                <motion.tr
                  key={room.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  className="hover:bg-secondary/50 transition-colors duration-200 cursor-pointer"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{room.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{room.capacity} seats</td>
                  <td className="px-5 py-3">
                    <span className={`flex items-center gap-1.5 text-xs font-medium ${config.className}`}>
                      <Icon className="h-3.5 w-3.5" />
                      {config.label}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">
                    {room.currentEvent || "—"}
                    {room.nextAvailable && <span className="ml-2 text-xs">(free at {room.nextAvailable})</span>}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
