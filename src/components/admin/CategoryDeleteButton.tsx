"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteCategory } from "@/app/admin/actions/categories";
import { ConfirmDialog } from "./ConfirmDialog";
import { useToast } from "./Toast";

export function CategoryDeleteButton({
  id,
  name,
  productCount,
  others,
}: {
  id: string;
  name: string;
  productCount: number;
  others: { _id: string; name: string }[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState(others[0]?._id ?? "");
  const [pending, start] = useTransition();
  const blocked = productCount > 0 && others.length === 0;

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="rounded p-2 text-red-600 hover:bg-red-50" aria-label={`Delete ${name}`}>
        <Trash2 aria-hidden className="h-4 w-4" />
      </button>
      <ConfirmDialog
        open={open}
        title={`Delete "${name}"?`}
        busy={pending}
        confirmLabel={productCount > 0 ? "Move products & delete" : "Delete"}
        message={
          productCount === 0 ? (
            "This category has no products and can be safely deleted."
          ) : blocked ? (
            `${productCount} product(s) use this category and there is no other category to move them to. Create another category first.`
          ) : (
            `${productCount} product(s) use this category. Choose where to move them before deleting.`
          )
        }
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          if (blocked) return toast("error", "Create another category first.");
          start(async () => {
            const res = await deleteCategory(id, productCount > 0 ? target : null);
            if (!res.ok) return toast("error", res.error);
            toast("success", res.message ?? "Deleted.");
            setOpen(false);
            router.refresh();
          });
        }}
      >
        {productCount > 0 && !blocked && (
          <div className="mt-4">
            <label htmlFor={`reassign-${id}`} className="field-label">Move products to</label>
            <select id={`reassign-${id}`} value={target} onChange={(e) => setTarget(e.target.value)} className="field-input">
              {others.map((o) => (
                <option key={o._id} value={o._id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </ConfirmDialog>
    </>
  );
}
