interface ChartEmptyStateProps {
  message?: string;
  className?: string;
}

export function ChartEmptyState({
  message = "データがありません",
  className,
}: ChartEmptyStateProps) {
  const classes = [
    "flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-10 text-center",
    "text-sm font-medium text-slate-500",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      <p>{message}</p>
    </div>
  );
}
