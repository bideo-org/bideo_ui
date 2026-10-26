import { Skeleton } from "@/components/ui/skeleton";

export default function WatchLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 animate-in fade-in duration-150">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left: Main Player & Video Details Skeleton (Col 8) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Theater Video Player Skeleton */}
          <div className="relative rounded-2xl overflow-hidden bg-black/40 aspect-video ring-1 ring-border/50 shadow-2xl flex items-center justify-center">
            <Skeleton className="w-full h-full rounded-2xl" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center animate-pulse">
                <div className="w-0 h-0 border-y-8 border-y-transparent border-l-12 border-l-white/40 ml-1" />
              </div>
              <span className="text-xs text-muted-foreground/70 font-medium tracking-wide">
                Loading video player...
              </span>
            </div>
          </div>

          {/* Video Metadata Header Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-8 w-4/5 rounded-lg" />
            <Skeleton className="h-5 w-1/3 rounded-md" />

            {/* Creator & Action Bar Skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
              <div className="flex items-center gap-3">
                <Skeleton className="w-11 h-11 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-32 rounded-md" />
                  <Skeleton className="h-3 w-20 rounded-md" />
                </div>
                <Skeleton className="h-9 w-24 rounded-full ml-2" />
              </div>

              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-24 rounded-full" />
                <Skeleton className="h-9 w-20 rounded-full" />
                <Skeleton className="h-9 w-10 rounded-full" />
              </div>
            </div>

            {/* Description Box Skeleton */}
            <div className="rounded-xl p-4 bg-muted/40 border border-border/40 space-y-2">
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-5/6 rounded-md" />
              <Skeleton className="h-4 w-2/3 rounded-md" />
            </div>
          </div>
        </div>

        {/* Right: Sidebar Related Videos Skeleton (Col 4) */}
        <div className="lg:col-span-4 space-y-4">
          <Skeleton className="h-6 w-32 rounded-md" />
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex gap-3 items-start">
                <Skeleton className="w-40 aspect-video rounded-xl shrink-0" />
                <div className="flex-1 space-y-2 py-0.5">
                  <Skeleton className="h-4 w-full rounded-md" />
                  <Skeleton className="h-3 w-3/4 rounded-md" />
                  <Skeleton className="h-3 w-1/2 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
