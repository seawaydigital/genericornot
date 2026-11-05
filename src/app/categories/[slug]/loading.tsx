import { SkeletonCardGridPage } from "@/components/ui/Skeleton";

export default function CategoryDetailLoading() {
  return <SkeletonCardGridPage count={9} withIcon withFilters />;
}
