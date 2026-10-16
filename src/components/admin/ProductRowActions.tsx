"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Eye, EyeOff, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { deleteProduct, setProductPublished } from "@/app/admin/actions/products";
import { ConfirmDialog } from "./ConfirmDialog";
import { useToast } from "./Toast";

export function ProductRowActions({ id, name, slug, published }: { id: string; name: string; slug: string; published: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [confirm, setConfirm] = useState(false);

  const run = (fn: () => Promise<{ ok: boolean; error?: string; message?: string }>) =>
    start(async () => {
      const res = await fn();
      if (res.ok) {
        toast("success", res.message ?? "Done.");
        setConfirm(false);
        router.refresh();
      } else toast("error", res.error ?? "Something went wrong.");
    });

  return (
    <div className="flex items-center justify-end gap-1">
      <Link href={`/admin/products/${id}`} className="rounded p-2 text-gray-600 hover:bg-gray-100" aria-label={`Edit ${name}`}>
        <Pencil aria-hidden className="h-4 w-4" />
      </Link>
      <button
        type="button"
        disabled={pending}
        onClick={() => run(() => setProductPublished(id, !published))}
        className="rounded p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
        aria-label={published ? `Unpublish ${name}` : `Publish ${name}`}
        title={published ? "Unpublish" : "Publish"}
      >
        {published ? <EyeOff aria-hidden className="h-4 w-4" /> : <Eye aria-hidden className="h-4 w-4" />}
      </button>
      {published && (
        <Link href={`/products/${slug}`} target="_blank" className="rounded p-2 text-gray-600 hover:bg-gray-100" aria-label={`View ${name} on site`}>
          <ExternalLink aria-hidden className="h-4 w-4" />
        </Link>
      )}
      <button
        type="button"
        disabled={pending}
        onClick={() => setConfirm(true)}
        className="rounded p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
        aria-label={`Delete ${name}`}
      >
        <Trash2 aria-hidden className="h-4 w-4" />
      </button>
      <ConfirmDialog
        open={confirm}
        title="Delete product?"
        message={
          <>
            <strong>{name}</strong> and its uploaded images will be permanently removed.
          </>
        }
        busy={pending}
        onCancel={() => setConfirm(false)}
        onConfirm={() => run(() => deleteProduct(id))}
      />
    </div>
  );
}
