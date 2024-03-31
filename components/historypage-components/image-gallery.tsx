"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { fetchUserGeneratedImages } from "@/app/_api/getUserGeneratedImages";
import { useQuery } from "@tanstack/react-query";

const ImageGallery = ({ userId }: any) => {
  const { data, isLoading } = useQuery({
    queryKey: ["userGeneratedImages", userId],
    queryFn: () => fetchUserGeneratedImages(userId),
  });

  if (!isLoading) {
    console.log(data);
  }
  return (
    <div className="grid grid-cols-6 md:grid-cols-4 xl:grid-cols-2 gap-2">
      {!data && (
        <div className="text-white">No images found, generate some</div>
      )}
      {data &&
        data?.map((item) => (
          <Dialog key={item.id}>
            <DialogTrigger asChild>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    {item.positive_prompt}
                  </CardTitle>
                  <CardDescription>{item.model}</CardDescription>
                </CardHeader>
                <CardContent>
                  <img
                    src={`data:image/jpg;base64,${item.image_data[0].base64_string}`}
                    alt={item.positive_prompt}
                  />
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent>
              <Card>
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
        ))}
    </div>
  );
};

export default ImageGallery;
