import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Eight shimmering cards, matching the grid's column count at each breakpoint. */
export function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
      )}
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-xl border border-border bg-card"
        >
          <Skeleton className="aspect-video w-full rounded-none" />
          <div className="space-y-2 p-4">
            <Skeleton className="h-5 w-3/4" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Matching placeholder for list view. */
export function SkeletonList({ count = 8 }: { count?: number }) {
  return (
    <div
      className="divide-y divide-border rounded-xl border border-border bg-card"
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex items-center gap-3 px-3 py-2">
          <Skeleton className="size-10 shrink-0 rounded-md" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="hidden h-4 w-40 sm:block" />
          <Skeleton className="hidden h-4 w-32 md:block" />
        </div>
      ))}
    </div>
  );
}

/** Announced while the board list is loading. */
export function BoardGridSkeleton() {
  return <span className="sr-only">Loading your boards…</span>;
}
