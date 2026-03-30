import { ApprovalQueue } from "@/components/ApprovalQueue";

export function ApprovalsView() {
  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-foreground leading-tight">Approvals</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Review and manage event proposals</p>
      </div>
      <ApprovalQueue />
    </div>
  );
}
