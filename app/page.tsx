"use client";
import SearchBar from "@/components/homepage-components/SearchBar";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { fetchImages } from "./_api/fetchImage_demo";
import { useDebounce } from "@/components/ui/multiple-selector";
import Loading from "@/components/misc-components/Loading";
import ImageCard from "@/components/homepage-components/ImageCard";

// interface PhotoType{

// }

const Home = () => {
  const sentinelRef = useRef(null);
  const [search, setSearch] = useState("");
  const [value] = useDebounce(search, 300);

  const { isLoading, data, hasNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: ["images", value],
    queryFn: ({ pageParam = 1 }) => fetchImages(pageParam as number, value),
    getNextPageParam: (lastPage, allPages) => {
      const nextPage = allPages.length + 1;
      return nextPage <= lastPage.total_pages ? nextPage : undefined;
    },
    initialPageParam: 1,
  });

  const photos = data?.pages.flatMap((page) => page.results);

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
            <Loading />
          ) : photos && photos.length < 1 ? (
            <p className="mx-auto text-lg font-medium text-white">
              No image found
            </p>
          ) : (
            <div className=" columns-2 md:columns-4 xl:columns-6 gap-2 p-3">
              {photos?.map((photo, idx) => (
                <ImageCard key={idx} photo={photo} />
              ))}
            </div>
          )}
          {hasNextPage && (
            <div ref={sentinelRef} className="mx-auto">
              <Loading />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Home;
