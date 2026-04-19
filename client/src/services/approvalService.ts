import { httpClient } from "@/external/httpClient";

export interface ApprovalResponseData {
  id: string;
  eventId: string;
  eventTitle: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  submittedById: string;
  submittedByName: string;
  submittedAt: string;
  reviewedById: string | null;
  reviewedByName: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
}

export async function getPendingApprovals(token: string) {
  return httpClient<ApprovalResponseData[]>("GET", "/api/approvals/pending", undefined, token);
}

export async function submitForApproval(token: string, eventId: string) {
  return httpClient<ApprovalResponseData>("POST", "/api/approvals", { eventId }, token);
}

export async function approveRequest(token: string, approvalId: string) {
  return httpClient<ApprovalResponseData>("POST", `/api/approvals/${approvalId}/approve`, undefined, token);
}

export async function rejectRequest(token: string, approvalId: string, rejectionReason: string) {
  return httpClient<ApprovalResponseData>("POST", `/api/approvals/${approvalId}/reject`, { rejectionReason }, token);
}
