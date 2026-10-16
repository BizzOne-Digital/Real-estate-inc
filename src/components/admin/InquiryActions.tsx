"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { CheckCircle2, Circle, Eye, Trash2 } from "lucide-react";
import { deleteInquiry, setInquiryStatus } from "@/app/admin/actions/content";
import { ConfirmDialog } from "./ConfirmDialog";
import { useToast } from "./Toast";

type Status = "new" | "read" | "resolved";

export function InquiryActions({ id, status }: { id: string; status: Status }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [confirm, setConfirm] = useState(false);
  const autoMarked = useRef(false);

  // Opening a new inquiry marks it as read.
  useEffect(() => {
    if (status === "new" && !autoMarked.current) {
      autoMarked.current = true;
      setInquiryStatus(id, "read").then((r) => r.ok && router.refresh());
    }
  }, [id, status, router]);

  const setStatus = (s: Status) =>
    start(async () => {
      const res = await setInquiryStatus(id, s);
      if (!res.ok) return toast("error", res.error);
      toast("success", res.message ?? "Updated.");
      router.refresh();
    });

  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" className="admin-btn-ghost" disabled={pending || status === "new"} onClick={() => setStatus("new")}>
        <Circle aria-hidden className="h-4 w-4" /> Mark new
      </button>
      <button type="button" className="admin-btn-ghost" disabled={pending || status === "read"} onClick={() => setStatus("read")}>
        <Eye aria-hidden className="h-4 w-4" /> Mark read
      </button>
      <button type="button" className="admin-btn" disabled={pending || status === "resolved"} onClick={() => setStatus("resolved")}>
        <CheckCircle2 aria-hidden className="h-4 w-4" /> Mark resolved
      </button>
      <button type="button" className="admin-btn-ghost text-red-700" disabled={pending} onClick={() => setConfirm(true)}>
        <Trash2 aria-hidden className="h-4 w-4" /> Delete
      </button>
      <ConfirmDialog
        open={confirm}
        title="Delete this inquiry?"
        message="This message will be permanently deleted."
        busy={pending}
        onCancel={() => setConfirm(false)}
        onConfirm={() =>
          start(async () => {
            const res = await deleteInquiry(id);
            if (!res.ok) return toast("error", res.error);
            toast("success", res.message ?? "Deleted.");
            router.replace("/admin/inquiries");
          })
        }
      />
    </div>
  );
}
