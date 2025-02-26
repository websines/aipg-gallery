"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchPublicImages } from "@/app/_api/fetchPublicImages";
import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Download, Heart, ImageIcon } from "lucide-react";
import SearchBar from "./SearchBar";
import ImageDetailModal from "./ImageDetailModal";

export default function HomePage() {
  const [value, setValue] = useState("");
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { isLoading, data, hasNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: ["images", value],
    queryFn: ({ pageParam = 1 }) => fetchPublicImages(pageParam as number, value),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length === 0) return undefined; // Halt if the last page was empty or undefined
      const nextPage = allPages.length + 1;
      return nextPage;
    },
  });

  const flattenedData = useMemo(() => {
    return data?.pages.flatMap((page) => page) || [];
  }, [data]);
  
  const handleImageClick = (image: any) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              AI Image Gallery
            </h1>
            <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
              Explore a collection of AI-generated images or create your own unique artwork with our advanced image generation tools.
            </p>
          </div>

          {/* Search Section */}
          <div className="max-w-2xl mx-auto">
            <SearchBar value={value} setValue={setValue} />
          </div>

          {/* Gallery Section */}
          <div className="mt-12">
            {isLoading ? (
              <div className="flex justify-center items-center min-h-[200px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : flattenedData.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {flattenedData.map((image) => (
                    <div
                      key={image.id}
                      className="group relative overflow-hidden rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all duration-300 shadow-md hover:shadow-xl cursor-pointer"
                      onClick={() => handleImageClick(image)}
                    >
                      <div className="aspect-square overflow-hidden">
                        {image.image_data && image.image_data.length > 0 ? (
                          image.image_data[0].image_url.includes('r2.cloudflarestorage.com') ? (
                            // Use regular img tag for Cloudflare R2 URLs
                            <img
                              src={image.image_data[0].image_url}
                              alt={image.positive_prompt || "AI generated image"}
                              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            // Use Next.js Image component for other URLs
                            <Image
                              src={image.image_data[0].image_url}
                              alt={image.positive_prompt || "AI generated image"}
                              width={500}
                              height={500}
                              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                            />
                          )
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                            <p className="text-zinc-500">Image not available</p>
                          </div>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                        <p className="text-white text-sm line-clamp-3 mb-2">
                          {image.positive_prompt}
                        </p>
                        {image.image_data && image.image_data.length > 1 && (
                          <div className="bg-black/50 text-white text-xs px-2 py-1 rounded absolute top-2 right-2">
                            +{image.image_data.length - 1} more
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-zinc-400">
                            {new Date(image.created_at).toLocaleDateString()}
                          </span>
                          <div className="flex gap-2">
                            <button className="p-1.5 rounded-full bg-zinc-800/80 text-white hover:bg-indigo-500/80 transition-colors">
                              <Heart className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 rounded-full bg-zinc-800/80 text-white hover:bg-indigo-500/80 transition-colors">
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Load More Button */}
                {hasNextPage && (
                  <div className="flex justify-center mt-10">
                    <Button
                      onClick={() => fetchNextPage()}
                      variant="outline"
                      className="px-6 py-2 rounded-md bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-700/50 hover:border-zinc-600 text-white"
                    >
                      Load More
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-800/50 mb-4">
                  <ImageIcon className="w-8 h-8 text-zinc-400" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">No images found</h3>
                <p className="text-zinc-400 max-w-md mx-auto">
                  {value
                    ? `No images matching "${value}" were found. Try a different search term.`
                    : "There are no images to display yet. Try generating some!"}
                </p>
                <Link 
                  href="/generate" 
                  className="mt-6 inline-flex items-center px-4 py-2 rounded-md bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-medium hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transition-colors"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Generate Images
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Image Detail Modal */}
      <ImageDetailModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        image={selectedImage}
      />
    </div>
  );
}
