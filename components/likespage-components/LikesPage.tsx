"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { LoadingSpinner } from "@/components/misc-components/LoadingSpinner";
import { User } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import { fetchUserLikedImages } from "@/app/_api/fetchUserLikedImages";
import ImageCard from "../misc-components/ImageCard";

const LikesPage = ({ user }: { user: User | null }) => {
  const sentinelRef = useRef(null);

  const { isLoading, data, hasNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: ["userLikedImages", user?.id],
    queryFn: ({ pageParam = 1 }) =>
      fetchUserLikedImages(user?.id, pageParam as number),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage!.length === 0) return undefined; // Halt if the last page was empty
      const nextPage = allPages.length + 1;
      return nextPage;
    },
    initialPageParam: 1,
    enabled: user != null,
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
      <div className="flex flex-col justify-center items-center my-8 bg-grid-small-white/[0.2]">
        <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
        <div className="my-8 self-center text-5xl gap-2 flex flex-row items-center font-medium">
          Likes
        </div>
        <div className="my-4">
          {!user && (
            <p className="mx-auto text-lg font-medium text-white">
              Log In Required
            </p>
          )}
          {isLoading ? (
            <LoadingSpinner />
          ) : photos && photos.length < 1 ? (
            <p className="mx-auto text-lg font-medium text-white">
              No images found
            </p>
          ) : (
            <div className="columns-2 md:columns-4 xl:columns-5 p-2 gap-2 space-y-2">
              {photos?.map((photo, idx) => (
                <motion.div
                  key={idx}
                  className="break-inside-avoid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* <LikesGallery item={photo} userID={user?.id} /> */}
                  <ImageCard item={photo.image_metadata} user={user?.id} />
                </motion.div>
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

export default LikesPage;
