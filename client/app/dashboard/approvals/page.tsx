"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/client/state/auth";
import { useRouter } from "next/navigation";
import * as approvalService from "@/services/approvalService";
import type { ApprovalResponseData } from "@/services/approvalService";
import { Calendar, User, MapPin, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ApprovalsPage() {
  const { token, hasRole } = useAuth();
  const router = useRouter();
  const [approvals, setApprovals] = useState<ApprovalResponseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const isCoordinator = hasRole("COORDINATOR") || hasRole("ADMIN");

  useEffect(() => {
    if (!isCoordinator) {
      router.replace("/dashboard");
    }
  }, [isCoordinator, router]);

  const fetchApprovals = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const res = await approvalService.getPendingApprovals(token);
    if (res.success) setApprovals(res.data);
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchApprovals(); }, [fetchApprovals]);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const handleApprove = async (approvalId: string) => {
    if (!token) return;
    setProcessing(approvalId);
    try {
      const res = await approvalService.approveRequest(token, approvalId);
      if (res.success) {
        showToast("Event approved successfully.", true);
        await fetchApprovals();
      } else {
        showToast("Failed to approve.", false);
      }
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (approvalId: string) => {
    if (!token || !rejectReason.trim()) return;
    setProcessing(approvalId);
    try {
      const res = await approvalService.rejectRequest(token, approvalId, rejectReason.trim());
      if (res.success) {
        showToast("Event rejected.", true);
        setRejectingId(null);
        setRejectReason("");
        await fetchApprovals();
      } else {
        showToast("Failed to reject.", false);
      }
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="p-6 space-y-5">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${
            toast.ok ? "bg-green-600 text-white" : "bg-destructive text-destructive-foreground"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-semibold text-foreground leading-tight">Approvals</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Review and manage event proposals</p>
      </div>

      {/* Queue card */}
      <div className="rounded-xl bg-card border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Pending Approvals</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {loading ? "Loading…" : `${approvals.length} event${approvals.length !== 1 ? "s" : ""} waiting for review`}
            </p>
          </div>
          {approvals.length > 0 && (
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary">
              {approvals.length} pending
            </span>
          )}
        </div>

        {loading ? (
          <div className="text-center text-sm text-muted-foreground py-10">Loading…</div>
        ) : approvals.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-10">
            No pending approvals. All caught up!
          </div>
        ) : (
          <div className="divide-y divide-border">
            {approvals.map((item) => (
              <div key={item.id} className="px-5 py-4 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{item.eventTitle}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />{item.submittedByName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(item.submittedAt).toLocaleDateString("en-GB", {
                          day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      className="gap-1.5 bg-green-600 hover:bg-green-700 text-white"
                      disabled={processing === item.id}
                      onClick={() => handleApprove(item.id)}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {processing === item.id ? "…" : "Approve"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                      disabled={processing === item.id}
                      onClick={() => setRejectingId(rejectingId === item.id ? null : item.id)}
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Reject
                    </Button>
                  </div>
                </div>

                {/* Inline reject form */}
                {rejectingId === item.id && (
                  <div className="rounded-lg bg-secondary/50 p-3 space-y-2">
                    <p className="text-xs font-medium text-foreground">Reason for rejection</p>
                    <textarea
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={2}
                      placeholder="Explain why this event is being rejected…"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={!rejectReason.trim() || processing === item.id}
                        onClick={() => handleReject(item.id)}
                      >
                        {processing === item.id ? "Rejecting…" : "Confirm Rejection"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setRejectingId(null); setRejectReason(""); }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
