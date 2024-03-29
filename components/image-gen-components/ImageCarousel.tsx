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
import useJobIdStore from "@/stores/jobIDStore";
import { checkImageStatus } from "@/app/_api/checkImageStatus";
import { useEffect, useState } from "react";
import { getFinishedImage } from "@/app/_api/fetchFinishedImage";
import { User } from "@supabase/supabase-js";

import useImageMetadataStore from "@/stores/ImageMetadataStore";
import { metadata } from "@/app/layout";
import {
  saveImageData,
  saveMetadata,
  uploadImage,
} from "@/app/_api/saveImageToSupabase";
import { base64toBlob } from "@/utils/helperUtils";

const ImageCarousel = ({ user }: { user: User | null }) => {
  const jobID = useJobIdStore((state: any) => state.jobId);
  const metadata = useImageMetadataStore((state) => state.metadata);
  const addImg = useImageMetadataStore((state) => state.addImage);

  const [finalImages, setImages] = useState<any>(null);
  const [shouldRefetch, setShouldRefetch] = useState(true);
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

  const { data: imgStatus } = useQuery({
    queryKey: ["checkImgStatus", jobID],
    queryFn: () => checkImageStatus(jobID),
    refetchInterval: shouldRefetch ? 1000 : false,
    enabled: jobID !== "",
  });

  const { data: finsihedImage } = useQuery({
    queryKey: ["finishedImage", jobID], // Ensure a unique query key
    queryFn: () => getFinishedImage(jobID),
    enabled: imgStatus?.done,
  });

  useEffect(() => {
    if (imgStatus?.done && shouldRefetch) {
      setShouldRefetch(false); // Set shouldRefetch to false to avoid triggering again
    }
  }, [imgStatus, shouldRefetch]);
  useEffect(() => {
    if (finsihedImage?.success) {
      setImages(finsihedImage);
      useJobIdStore.getState().clearJobId();
    }
  }, [finsihedImage]);

  useEffect(() => {
    if (finalImages != null) {
      console.log("adding images...");
      finalImages.generations.map((item: any) => {
        addImg({
          base64String: item.base64String,
          seed: item.seed,
        });
      });
    }
  }, [finalImages, addImg]);

  useEffect(() => {
    async function imgWorker(userId: any) {
      try {
        const metadataId = await saveMetadata(metadata, userId);

        const uploadedImageUrls = [];
        if (finalImages != null) {
          for (const image of finalImages.generations) {
            const file = base64toBlob(image.base64String);
            const imageUrl = await uploadImage(file, metadataId);

            if (imageUrl) {
              uploadedImageUrls.push(imageUrl);
              await saveImageData(image, metadataId);
            } else {
              console.log(error?.message);
            }
          }
        }

        // Success! Do something with uploadedImageUrls if needed
      } catch (error) {
        console.error("Error during save:", error);
        // Display error to the user
      }
    }

    imgWorker(user?.id);
  }, [finalImages, addImg]);

  return (
    <>
      <Card>
        <CardHeader className="mx-auto flex text-center">
          <CardTitle>AIPG IMAGE GENERATOR</CardTitle>
          <div className="flex flex-row justify-between p-2 m-2 items-center">
            <div className=" flex flex-row items-center gap-1">
              <div
                className={`w-2 h-2 ${
                  performance?.worker_count > 0 ? "bg-green-500" : "bg-red-500"
                } rounded-full`}
              />
              <div className="text-md font-medium">
                {performance?.worker_count} Workers{" "}
                {performance?.worker_count > 0 ? "online" : "offline"}
              </div>
            </div>
            <Dialog>
              <DialogTrigger
                className="hover:bg-gray-800 cursor-pointer"
                type="button"
              >
                Stats
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
          </div>
        </CardHeader>
        <CardContent className="">
          <Carousel className="w-full max-w-xs mx-auto">
            <CarouselContent>
              {finalImages?.success! &&
                finalImages?.generations.map(
                  (generatedImg: any, index: any) => (
                    <CarouselItem key={index}>
                      <div className="p-1">
                        <Card>
                          <CardContent className="flex aspect-square items-center justify-center p-6 bg-white">
                            {generatedImg && (
                              <img
                                src={`data:image/jpg;base64,${generatedImg.base64String}`}
                                className="h-[512px] w-[512px] object-contain"
                                alt="img"
                              />
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </CarouselItem>
                  )
                )}
            </CarouselContent>
            {finalImages?.success && (
              <div>
                <CarouselPrevious />
                <CarouselNext />
              </div>
            )}
          </Carousel>
        </CardContent>

        {jobID && (
          <CardFooter className="flex flex-col my-4 gap-2">
            <div className="flex flex-row items-center justify-center gap-2">
              <p className="text-md font-semibold text-white">
                Generating Your Images
              </p>{" "}
              <span>
                <Loading />
              </span>
            </div>
            <div className="">Job ID: {jobID as string}</div>
            <div>Wait Time: {imgStatus?.wait_time}</div>
          </CardFooter>
        )}
        {finalImages?.success && (
          <div className="text-white p-4 text-center font-medium m-2">
            Your images are generated
          </div>
        )}
      </Card>
    </>
  );
};

export default ImageCarousel;
