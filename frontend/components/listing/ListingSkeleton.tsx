export function ListingSkeleton() {
  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="animate-pulse">
        <div className="h-48 w-full rounded-t-xl bg-slate-200 dark:bg-slate-800" />
        <div className="space-y-4 p-4">
          <div>
            <div className="mb-2 h-5 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-5 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
          </div>

          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-800" />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="h-5 w-28 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-10 w-24 rounded-lg bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      </div>
    </article>
  );
}
