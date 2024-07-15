"use client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { AuthForm } from "@/components/auth-components/AuthForm";
import { useState, useCallback, useEffect } from "react";
import DownloadBtnComponent from "./DownloadBtn";
import { Heart } from "lucide-react";
import Image from "next/image";

const CarouselComponent = ({ images, userID, isLiked, toggleLike }: any) => {
  const [api, setApi] = useState<CarouselApi>();
  const [thumbsapi, setThumbsApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onThumbClick = useCallback(
    (index: number) => {
      if (!api || !thumbsapi) {
        return;
      }

      api.scrollTo(index);
    },
    [api, thumbsapi]
  );

  const onSelect = useCallback(() => {
    if (!api || !thumbsapi) {
      return;
    }

    setSelectedIndex(api.selectedScrollSnap());
    thumbsapi.scrollTo(api.selectedScrollSnap());
  }, [api, thumbsapi, setSelectedIndex]);

  useEffect(() => {
    if (!api || !thumbsapi) {
      return;
    }
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);
  }, [api]);

  const imageKitLoader = ({ src, width, quality }: any) => {
    // Extract the image filename from the full URL
    const imageFilename = src.split("/").pop();

    // Define the transformation parameters
    const params = [`w-${width}`];
    if (quality) {
      params.push(`q-${quality}`);
    }
    const paramsString = params.join(",");

    // Construct the ImageKit URL
    let urlEndpoint = "https://ik.imagekit.io/tkafllsgm";
    if (urlEndpoint[urlEndpoint.length - 1] === "/") {
      urlEndpoint = urlEndpoint.substring(0, urlEndpoint.length - 1);
    }

    // console.log(`${urlEndpoint}/${imageFilename}?tr=${paramsString},f-webp`);
    return `${urlEndpoint}/${imageFilename}?tr=${paramsString},f-jpg`;
  };

  return (
    <div className="flex flex-col gap-2 max-w-[60%] ">
      <Carousel
        className="w-full mx-auto my-6 md:my-0 relative"
        setApi={setApi}
      >
        <CarouselContent>
          {images.map((image: any) => (
            <CarouselItem key={image.id}>
              <div className="p-0 bg-white relative">
                <Image
                  loader={imageKitLoader}
                  height={400}
                  width={400}
                  loading="lazy"
                  src={image.image_url}
                  className="w-full h-auto object-cover"
                  alt={image.seed}
                  quality={80}
                  sizes="100vw"
                />
                <DownloadBtnComponent photo={image} />
              </div>
              <div className="absolute hover:bg-black/50 border rounded-xl p-2 items-center top-5 right-5 bg-black/80">
                {userID ? (
                  <button onClick={toggleLike}>
                    {isLiked ? (
                      <Heart className="w-6 h-6 fill-red-500" />
                    ) : (
                      <Heart className="w-6 h-6 text-gray-300" /> /* Dimmed heart when not liked */
                    )}
                  </button>
                ) : (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Heart className="w-6 h-6 text-gray-300 cursor-pointer " />
                    </DialogTrigger>
                    <DialogContent>
                      <AuthForm />
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute top-1/2 left-3" />
        <CarouselNext className="absolute top-1/2 right-3" />
      </Carousel>

      <Carousel
        setApi={setThumbsApi}
        opts={{ dragFree: true, containScroll: "keepSnaps" }}
      >
        <CarouselContent className="-ml-1 flex flex-row items-center justify-center">
          {images.map((image: any, index: number) => (
            <div
              className={`${index === selectedIndex ? "" : "opacity-50"} pl-1`}
              key={index}
              onClick={() => onThumbClick(index)}
            >
              <Image
                loader={imageKitLoader}
                src={image.image_url}
                height={75}
                width={75}
                className="w-[75px] h-[75px] object-cover rounded-lg"
                alt={image.seed}
                priority={true}
              />
            </div>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default CarouselComponent;
