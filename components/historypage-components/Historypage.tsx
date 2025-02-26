"use client";
import HistorySearch from "@/components/historypage-components/search-bar";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useDebounce } from "use-debounce";
import { LoadingSpinner } from "@/components/misc-components/LoadingSpinner";
import { User } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import ImageCard from "@/components/misc-components/ImageCard";
import { fetchUserGeneratedImages } from "@/app/_api/getUserGeneratedImages";

const HistoryPage = ({ user }: { user: User | null }) => {
  const sentinelRef = useRef(null);
  const [search, setSearch] = useState("");
  const [value] = useDebounce(search, 300);

  const { isLoading, data, hasNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: ["usergeneratedImages", value, user?.id],
    queryFn: ({ pageParam = 1 }) =>
      fetchUserGeneratedImages(user?.id, pageParam as number, value),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length === 0) return undefined;
      return allPages.length + 1;
    },
    enabled: !!user,
  });

  const photos = data?.pages.flat() || [];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 }
    );

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
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col justify-center items-center">
        <HistorySearch
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="w-full mt-6">
          {!user && (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
              <p className="text-lg font-medium text-white">
                Log in to view your image history
              </p>
            </div>
          )}
          {isLoading ? (
            <div className="flex justify-center my-12">
              <LoadingSpinner />
            </div>
          ) : photos && photos.length < 1 ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
              <p className="text-lg font-medium text-white">
                No images found
              </p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
              {photos?.map((photo, idx) => (
                <motion.div
                  key={idx}
                  className="break-inside-avoid mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <ImageCard item={photo} user={user?.id} />
                </motion.div>
              ))}
            </div>
          )}
          {hasNextPage && (
            <div ref={sentinelRef} className="flex justify-center my-8">
              <LoadingSpinner />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
