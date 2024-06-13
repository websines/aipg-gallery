"use client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useState, useCallback, useEffect } from "react";
import DownloadBtnComponent from "./DownloadBtn";

const StaticImagesCarousel = ({ images }: { images: any[] }) => {
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
  }, [api, onSelect, thumbsapi]);

  return (
    <div className="flex flex-col gap-2">
      <Carousel
        className="w-full mx-auto my-6 md:my-0 relative"
        setApi={setApi}
      >
        <CarouselContent>
          {images.map((image: any) => (
            <CarouselItem key={image.id}>
              <div className="p-0 bg-white relative">
                <img
                  src={image.image_url}
                  className="w-full h-full object-cover"
                  alt={image.seed}
                />
                <DownloadBtnComponent photo={image} />
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
              <img
                src={image.image_url}
                className="w-[75px] h-[75px] object-cover rounded-lg"
                alt={image.seed}
              />
            </div>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default StaticImagesCarousel;
