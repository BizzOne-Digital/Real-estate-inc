"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { savePost } from "@/app/admin/actions/posts";
import { LocalImageField } from "./LocalImageField";
import { FormSection, RICH_TEXT_HELP, TextArea, TextField, Toggle } from "./fields";
import { useToast } from "./Toast";
import { POST_CATEGORIES, type PostCategory } from "@/lib/constants";
import { slugify } from "@/lib/utils";

export interface PostFormValues {
  title: string;
  slug: string;
  category: PostCategory;
  excerpt: string;
  body: string;
  coverImage: string;
  publishedAt: string; // yyyy-mm-dd
  published: boolean;
}

export function PostForm({ id, initial }: { id: string | null; initial: PostFormValues }) {
  const router = useRouter();
  const toast = useToast();
  const catId = useId();
  const [v, setV] = useState(initial);
  const [slugTouched, setSlugTouched] = useState(Boolean(id));
  const [uploading, setUploading] = useState(false);
  const [pending, start] = useTransition();
  const set = <K extends keyof PostFormValues>(k: K, val: PostFormValues[K]) => setV((s) => ({ ...s, [k]: val }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      // Publish at noon Toronto time on the chosen date so the date never shifts across time zones.
      const res = await savePost(id, { ...v, publishedAt: `${v.publishedAt}T12:00:00-05:00` });
      if (!res.ok) return toast("error", res.error);
      toast("success", res.message ?? "Saved.");
      if (!id && res.data) router.replace(`/admin/insights/${res.data.id}`);
      else router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <FormSection title="Article">
          <TextField
            label="Title"
            value={v.title}
            required
            max={180}
            onChange={(x) => {
              set("title", x);
              if (!slugTouched) set("slug", slugify(x));
            }}
          />
          <div>
            <TextField
              label="URL slug"
              value={v.slug}
              required
              max={160}
              onChange={(x) => {
                setSlugTouched(true);
                set("slug", x.toLowerCase());
              }}
            />
            <p className="mt-1 text-xs text-gray-500">/market-insights/{v.slug || "…"}</p>
          </div>
          <TextArea label="Summary" value={v.excerpt} onChange={(x) => set("excerpt", x)} max={500} rows={2} help="Shown on article cards and at the top of the article." />
          <TextArea label="Article text" value={v.body} onChange={(x) => set("body", x)} max={50000} rows={18} required help={RICH_TEXT_HELP} />
        </FormSection>
        <FormSection title="Cover image">
          <LocalImageField label="Cover image" folder="posts" value={v.coverImage} onChange={(x) => set("coverImage", x)} aspect="aspect-[16/9]" onBusyChange={setUploading} />
        </FormSection>
      </div>
      <aside className="space-y-6">
        <section className="admin-card space-y-4 p-5">
          <div>
            <label htmlFor={catId} className="field-label">Topic</label>
            <select id={catId} value={v.category} onChange={(e) => set("category", e.target.value as PostCategory)} className="field-input">
              {POST_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <TextField label="Publish date" type="date" value={v.publishedAt} onChange={(x) => set("publishedAt", x)} required help="Future dates stay hidden until that day." />
          <Toggle label="Published" checked={v.published} onChange={(x) => set("published", x)} />
        </section>
        <div className="flex gap-2">
          <button type="submit" className="admin-btn flex-1" disabled={pending || uploading}>
            {pending && <Loader2 aria-hidden className="h-4 w-4 animate-spin" />}
            {uploading ? "Waiting for upload…" : pending ? "Saving…" : id ? "Save changes" : "Create article"}
          </button>
          <Link href="/admin/insights" className="admin-btn-ghost">
            Cancel
          </Link>
        </div>
      </aside>
    </form>
  );
}
