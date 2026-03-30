import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import type { UserRole } from "@/components/RoleSelector";
import { DashboardView } from "@/components/views/DashboardView";
import { EventCatalogView } from "@/components/views/EventCatalogView";
import { ApprovalsView } from "@/components/views/ApprovalsView";
import { RoomsView } from "@/components/views/RoomsView";
import { ReportsView } from "@/components/views/ReportsView";
import { RegistrationsView } from "@/components/views/RegistrationsView";
import { StudentBrowseView } from "@/components/views/StudentBrowseView";
import { StudentRegistrationsView } from "@/components/views/StudentRegistrationsView";
import { StudentParticipationView } from "@/components/views/StudentParticipationView";
import { AdminUsersView } from "@/components/views/AdminUsersView";
import { AdminCategoriesView } from "@/components/views/AdminCategoriesView";
import { AdminSettingsView } from "@/components/views/AdminSettingsView";
import { CoordinatorDashboardView } from "@/components/views/CoordinatorDashboardView";
import { CoordinatorActivityView } from "@/components/views/CoordinatorActivityView";

const defaultPages: Record<UserRole, string> = {
  admin: "Dashboard",
  teacher: "Dashboard",
  student: "Browse Events",
  coordinator: "Dashboard",
};

const Index = () => {
  const [activeRole, setActiveRole] = useState<UserRole>("teacher");
  const [activePage, setActivePage] = useState("Dashboard");

  const handleRoleChange = (role: UserRole) => {
    setActiveRole(role);
    setActivePage(defaultPages[role]);
  };

  const renderPage = () => {
    switch (activePage) {
      // Shared
      case "Dashboard":
        return activeRole === "coordinator" ? <CoordinatorDashboardView /> : <DashboardView />;
      case "Events": return <EventCatalogView />;
      case "Approvals": return <ApprovalsView />;
      case "Registrations": return <RegistrationsView />;
      case "Rooms & Resources": return <RoomsView />;
      case "Reports": return <ReportsView />;
      // Admin
      case "User Management": return <AdminUsersView />;
      case "Categories": return <AdminCategoriesView />;
      case "Settings": return <AdminSettingsView />;
      // Student
      case "Browse Events": return <StudentBrowseView />;
      case "My Registrations": return <StudentRegistrationsView />;
      case "My Participation": return <StudentParticipationView />;
      // Coordinator
      case "Activity Monitor": return <CoordinatorActivityView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AppSidebar activePage={activePage} onNavigate={setActivePage} activeRole={activeRole} onRoleChange={handleRoleChange} />
      <main className="flex-1 overflow-y-auto">
        {renderPage()}
      </main>
    </div>
  );
};

export default Index;
