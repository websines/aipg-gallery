"use client";
import { useState } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Progress } from "../ui/progress";
import Loading from "../misc-components/Loading";

const ImageCarousel = () => {
  return (
    <>
      <Card>
        <CardHeader className="mx-auto flex text-center">
          <CardTitle>AIPG IMAGE GENERATOR</CardTitle>
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
          <Progress value={33} className="w-[40%]" />
        </CardFooter>
      </Card>
    </>
  );
};

export default ImageCarousel;
