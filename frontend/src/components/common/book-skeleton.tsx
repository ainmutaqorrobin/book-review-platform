import { Skeleton } from "@/components/ui/skeleton";

export default function BookSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="space-y-4 rounded-[1.9rem] border border-stone-900/10 bg-[#fffaf2]/88 p-5 shadow-[0_18px_40px_rgba(64,38,24,0.08)]"
        >
          <Skeleton className="h-72 rounded-[1.4rem]" />
          <Skeleton className="h-4 w-1/3 rounded-full" />
          <Skeleton className="h-10 w-4/5 rounded-xl" />
          <Skeleton className="h-4 w-2/5 rounded-full" />
          <Skeleton className="h-4 w-full rounded-full" />
          <Skeleton className="h-4 w-11/12 rounded-full" />
          <Skeleton className="h-10 w-32 rounded-full" />
        </div>
      ))}
    </div>
  );
}
