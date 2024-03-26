"use client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import Loading from "../misc-components/Loading";
import { useQuery } from "@tanstack/react-query";
import { fetchHordePerformace } from "@/app/_api/fetchHordePerformance";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogContent,
} from "../ui/dialog";
import { Button } from "../ui/button";

const ImageCarousel = () => {
  const {
    data: performance,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["performance"],
    queryFn: () => fetchHordePerformace(),
    refetchOnMount: "always",
    refetchInterval: 60000,
  });
  return (
    <>
      <Card>
        <CardHeader className="mx-auto flex text-center">
          <CardTitle>AIPG IMAGE GENERATOR</CardTitle>
          <CardDescription className="flex flex-row justify-between p-2 m-2 items-center">
            <div className=" flex flex-row items-center gap-1">
              <div
                className={`w-2 h-2 ${
                  performance?.worker_count > 0 ? "bg-green-500" : "bg-red-500"
                } rounded-full`}
              />
              <p>{performance?.worker_count} Workers Online</p>
            </div>
            <Dialog>
              <DialogTrigger>
                <Button variant={"ghost"} type="button">
                  Horde Stats
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>AIPG Horde Stats</DialogTitle>
                </DialogHeader>
                <div className="p-4 text-white colums-1 md:columns-2 gap-2">
                  <p>Queued requests: {performance?.queued_requests}</p>
                  <p>Queued megapixels: {performance?.queued_megapixels}</p>
                  <p>Thread_count: {performance?.thread_count}</p>
                  <p>Queued_tokens: {performance?.queued_tokens}</p>
                </div>
              </DialogContent>
            </Dialog>
          </CardDescription>
        </CardHeader>
        <CardContent className="">
          <Carousel className="w-full max-w-xs mx-auto">
            <CarouselContent>
              {Array.from({ length: 5 }).map((_, index) => (
                <CarouselItem key={index}>
                  <div className="p-1">
                    <Card>
                      <CardContent className="flex aspect-square items-center justify-center p-6 bg-white">
                        <span className="text-4xl font-semibold text-black">
                          {index + 1}
                        </span>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </CardContent>
        <CardFooter className="flex flex-col my-4 gap-2">
          <div className="flex flex-row items-center justify-center gap-2">
            <p className="text-md font-semibold text-white">
              Generating Your Images
            </p>{" "}
            <span>
              <Loading />
            </span>
          </div>
        </CardFooter>
      </Card>
    </>
  );
};

export default ImageCarousel;
