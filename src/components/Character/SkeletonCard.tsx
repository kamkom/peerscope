import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const SkeletonCard = () => {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <Skeleton className="h-40 w-full" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
};

export default SkeletonCard;
