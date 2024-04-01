"use client";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Heart } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchLikedStatus, likeorUnlikeImages } from "@/app/_api/likeImages";

const GalleryCard = ({ item, user }: any) => {
  const {
    isLoading,
    isError,
    data: isLiked,
    error,
    refetch,
  } = useQuery({
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
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{item.positive_prompt}</CardTitle>
              <CardDescription>{item.model}</CardDescription>
            </CardHeader>
            <CardContent>
              <img
                src={`data:image/jpg;base64,${item.image_data[0].base64_string}`}
                className="max-w-full object-cover"
                alt={item.positive_prompt}
              />
            </CardContent>
          </Card>
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

export default GalleryCard;
