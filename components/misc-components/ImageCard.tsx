"use client";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchLikedStatus, likeorUnlikeImages } from "@/app/_api/likeImages";

import { Button } from "../ui/button";
import { deleteUserImages } from "@/app/_api/deleteImage";
import CarouselComponent from "./CarouselComponent";

const ImageCard = ({ item, user }: any) => {
  const { data: isLiked, refetch } = useQuery({
    queryKey: ["imageLikeStatus", item.id, user], // Unique query key
    queryFn: () => fetchLikedStatus(item.id, user),
    enabled: !!user,
  });

  const { mutate: likeMutate } = useMutation({
    mutationKey: ["likeMutation", item.id, user],
    mutationFn: () => likeorUnlikeImages(user, item.id),
    onSuccess: async () => await refetch(),
    onError: (error) => console.error(error.message),
  });

  const { mutate: deleteMutate } = useMutation({
    mutationKey: ["deleteImages", item.id, user],
    mutationFn: () => deleteUserImages(item.id),
  });

  const toggleLike = (itemID: any, userID: any) => {
    if (user) {
      likeMutate(userID, itemID);
    }
  };
  return (
    <div>
      <Dialog key={item.id}>
        <DialogTrigger asChild>
          <div className="cursor-pointer relative rounded-sm overflow-hidden group">
            <motion.img
              // src={`data:image/jpg;base64,${item.image_data[0].base64_string}`}
              src={item.image_data[0].image_url}
              className="max-w-full object-cover rounded-sm"
              alt={item.positive_prompt}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 200 }}
            />
            {user && (
              <button
                onClick={() => toggleLike(item.id, user)}
                className="absolute top-2 right-2 bg-gray-900 bg-opacity-70 p-1 rounded-full opacity-0 group-hover:opacity-100 outline-none"
              >
                {isLiked ? (
                  <Heart className="w-6 h-6 fill-red-500" />
                ) : (
                  <Heart className="w-6 h-6" />
                )}
              </button>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-zinc-950 bg-opacity-45 p-2 text-white flex items-center justify-between transition-opacity duration-300 opacity-0 group-hover:opacity-100">
              <p className="truncate text-sm font-medium text-center">
                {item.positive_prompt}
              </p>
            </div>
          </div>
        </DialogTrigger>
        <DialogContent className="md:min-w-[70%] overflow-y-scroll bg-transaprent max-h-[80vh] md:max-h-[95vh] no-scrollbar backdrop-blur-md">
          <div className="p-4 flex flex-col md:flex-row bg-transparent items-center justify-center gap-6 relative backdrop-blur-lg order-2 md:order-1">
            <div className="flex flex-col items-start h-full justify-start gap-2 text-white md:w-[80%]">
              <div className="p-4 my-4 bg-opacity-40 bg-gray-800/50 rounded-lg flex flex-col items-start justify-start w-full">
                <p className="text-sm text-gray-300">Positive Prompt</p>
                <p className="text-md font-medium">{item.positive_prompt}</p>
              </div>
              <div className="grid grid-cols-2 gap-1 p-4 bg-gray-800/50 rounded-lg bg-opacity-40 w-full space-y-2">
                <div className="flex flex-col justify-start items-start gap-1 w-full">
                  <p className="text-sm text-gray-300">Model</p>
                  <p className="text-sm font-medium">{item.model}</p>
                </div>
                <div className="flex flex-col justify-start items-start gap-1">
                  <p className="text-sm text-gray-300">Sampler</p>
                  <p className="text-sm font-medium">{item.sampler}</p>
                </div>
                <div className="flex flex-col justify-start items-start gap-1">
                  <p className="text-sm text-gray-300">Guidance</p>
                  <p className="text-sm font-medium">{item.guidance}</p>
                </div>
                <div className="flex flex-col justify-start items-start gap-1">
                  <p className="text-sm text-gray-300">Seed</p>
                  <p className="text-sm font-medium">
                    {item.image_data[0].seed}
                  </p>
                </div>
              </div>

              <div className="p-4 my-4 bg-opacity-40 bg-gray-800/50 rounded-lg flex flex-col items-start justify-start ">
                <p className="text-sm text-gray-300">Negative Prompt</p>
                <p className="text-md font-medium tracking-tight">
                  {item.negative_prompt}
                </p>
              </div>

              {user === item.user_id && (
                <Button
                  variant="destructive"
                  onClick={() => deleteMutate(item.id)}
                >
                  Delete
                </Button>
              )}
            </div>

            <CarouselComponent
              images={item.image_data}
              isLiked={isLiked}
              toggleLike={() => toggleLike(item.id, user)}
              userID={user}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImageCard;
