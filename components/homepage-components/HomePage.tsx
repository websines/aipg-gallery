"use client";
import SearchBar from "@/components/homepage-components/SearchBar";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useDebounce } from "@/components/ui/multiple-selector";
import { LoadingSpinner } from "@/components/misc-components/LoadingSpinner";
import { fetchPublicImages } from "@/app/_api/fetchPublicImages";
import GalleryCard from "@/components/homepage-components/GalleryCard";
import { User } from "@supabase/supabase-js";

const Homepage = ({ user }: { user: User | null }) => {
  const sentinelRef = useRef(null);
  const [search, setSearch] = useState("");
  const [value] = useDebounce(search, 300);

  const { isLoading, data, hasNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: ["images", value],
    queryFn: ({ pageParam = 1 }) => fetchPublicImages(pageParam as number),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage!.length === 0) return undefined; // Halt if the last page was empty
      const nextPage = allPages.length + 1;
      return nextPage;
    },
    initialPageParam: 1,
  });

  const photos = data?.pages.flatMap((page: any) => page);

  useEffect(() => {
    if (!hasNextPage) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        fetchNextPage();
      }
    });
    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }
    return () => {
      if (sentinelRef.current) {
        observer.unobserve(sentinelRef.current);
      }
    };
  }, [hasNextPage, fetchNextPage]);
  return (
    <>
      <div className="flex flex-col justify-center items-center my-8">
        <SearchBar />
        <div className="my-4">
          {isLoading ? (
            <LoadingSpinner />
          ) : photos && photos.length < 1 ? (
            <p className="mx-auto text-lg font-medium text-white">
              No images found
            </p>
          ) : (
            <div className="flex flex-row gap-2 p-3">
              {photos?.map((photo, idx) => (
                <GalleryCard key={idx} item={photo} user={user?.id} />
              ))}
            </div>
          )}
          {hasNextPage && (
            <div ref={sentinelRef} className="mx-auto">
              <LoadingSpinner />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Homepage;
