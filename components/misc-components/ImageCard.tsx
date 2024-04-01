"use client";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Heart } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchLikedStatus, likeorUnlikeImages } from "@/app/_api/likeImages";

const ImageCard = ({ item, user }: any) => {
  const { data: isLiked, refetch } = useQuery({
    queryKey: ["imageLikeStatus", item.id, user], // Unique query key
    queryFn: () => fetchLikedStatus(item.id, user),
  });

  const { mutate } = useMutation({
    mutationKey: ["likeMutation", item.id, user],
    mutationFn: () => likeorUnlikeImages(user, item.id),
    onSuccess: async () => await refetch(),
    onError: (error) => console.error(error.message),
  });

  const toggleLike = (itemID: any, userID: any) => {
    if (user) {
      mutate(userID, itemID);
    }
  };
  return (
    <div>
      <Dialog key={item.id}>
        <DialogTrigger asChild>
          <div className="cursor-pointer relative rounded-sm overflow-hidden group">
            <motion.img
              src={`data:image/jpg;base64,${item.image_data[0].base64_string}`}
              className="max-w-full object-cover rounded-sm"
              alt={item.positive_prompt}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 200 }}
            />
            {user && (
              <button
                onClick={() => toggleLike(item.id, user.id)}
                className="absolute top-2 right-2 bg-gray-900 bg-opacity-70 p-1 rounded-full opacity-0 group-hover:opacity-100 focus:outline-none"
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
        <DialogContent className="mt-4">
          <Card>
            <CardHeader className="flex flex-row gap-2 items-center justify-start">
              {user ? (
                <button
                  onClick={() => toggleLike(item.id, user.id)}
                  className=""
                >
                  {isLiked ? (
                    <Heart className="w-6 h-6 fill-red-500" />
                  ) : (
                    <Heart className="w-6 h-6" />
                  )}
                </button>
              ) : (
                <div>Login to like</div>
              )}
            </CardHeader>
            <CardContent className="p-4">
              <Carousel className="w-full max-w-xs mx-auto h-[80%]">
                <CarouselContent>
                  {item.image_data.map((image: any) => (
                    <CarouselItem key={image.id}>
                      <Card>
                        <CardContent className="p-6 bg-white">
                          <img
                            src={`data:image/jpg;base64,${image.base64_string}`}
                            className="max-w-full object-cover"
                            alt={image.seed}
                          />
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
              <div className="flex flex-col items-center justify-center gap-2 text-white">
                <p>{item.positive_prompt}</p>
                <p>{item.negative_prompt}</p>
                <p>{item.sampler}</p>
                <p>{item.model}</p>
                <p>{item.public_view}</p>
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImageCard;
