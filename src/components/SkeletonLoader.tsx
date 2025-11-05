import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const ProfileCardSkeleton = () => (
  <div className="w-full max-w-sm mx-auto space-y-4">
    <Skeleton className="w-full h-96 rounded-2xl" />
    <div className="space-y-3 p-6">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-20 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="flex justify-center gap-4 pt-4">
        <Skeleton className="w-14 h-14 rounded-full" />
        <Skeleton className="w-14 h-14 rounded-full" />
      </div>
    </div>
  </div>
);

export const MatchListSkeleton = () => (
  <div className="space-y-4 px-4">
    {[1, 2, 3, 4].map((i) => (
      <Card key={i}>
        <CardContent className="p-4 flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="w-5 h-5" />
        </CardContent>
      </Card>
    ))}
  </div>
);

export const BadgeListSkeleton = () => (
  <div className="space-y-4 p-4">
    <div className="text-center space-y-2">
      <Skeleton className="h-8 w-48 mx-auto" />
      <Skeleton className="h-4 w-32 mx-auto" />
    </div>
    {[1, 2, 3, 4, 5].map((i) => (
      <Card key={i}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <Skeleton className="h-6 w-16 rounded" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    ))}
  </div>
);
