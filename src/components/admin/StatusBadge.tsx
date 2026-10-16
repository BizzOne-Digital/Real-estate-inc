export function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "new"
      ? "bg-amber-100 text-amber-800"
      : status === "resolved"
        ? "bg-emerald-100 text-emerald-800"
        : "bg-gray-100 text-gray-700";
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${cls}`}>{status}</span>;
}
