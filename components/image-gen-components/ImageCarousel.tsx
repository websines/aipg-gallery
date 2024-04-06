"use client";
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

import { saveImageData, saveMetadata } from "@/app/_api/saveImageToSupabase";
import { Info } from "lucide-react";
import { useToast } from "../ui/use-toast";

const ImageCarousel = ({ user }: { user: User | null }) => {
  const toast = useToast();
  const jobID = useJobIdStore((state: any) => state.jobId);
  const metadata = useImageMetadataStore((state) => state.metadata);
  const resetMetadata = useImageMetadataStore((state) => state.resetMetadata);
  const addImg = useImageMetadataStore((state) => state.addImage);

  const [finalImages, setImages] = useState<any>(null);
  const [shouldRefetch, setShouldRefetch] = useState(true);
  const { data: performance } = useQuery({
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
        if (metadata?.positivePrompt != "") {
          const metadataId = await saveMetadata(metadata, userId);
          resetMetadata();
          if (finalImages != null) {
            for (const image of finalImages.generations) {
              await saveImageData(image, metadataId);
            }
          }
        }
      } catch (error) {
        console.error("Error during save:", error);
      }
    }

    imgWorker(user?.id);
  }, [finalImages, addImg]);

  return (
    <div className="w-full">
      <Card className="w-[80vw] justify-start items-center border-0 p-2 rounded-lg bg-gray-800 border-1 border-zinc-950">
        <CardHeader className="mx-auto flex flex-col md:flex-row items-center justify-between text-center gap-4">
          <CardTitle>AIPG IMAGE GENERATOR</CardTitle>
          <div className="flex flex-row justify-between p-2 m-2 items-center">
            <div className=" flex flex-row items-center gap-1">
              <div
                className={`w-2 h-2 ${
                  performance?.worker_count > 0 ? "bg-green-500" : "bg-red-500"
                } rounded-full`}
              />
              <div className="text-md font-medium">
                {performance?.worker_count} Worker(s){" "}
                {performance?.worker_count > 0 ? "online" : "offline"}
              </div>
            </div>
            <Dialog>
              <DialogTrigger
                className="hover:bg-gray-800 cursor-pointer p-2 rounded-full"
                type="button"
              >
                <Info className="w-6 h-6" />
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
          <Carousel className="w-full mx-auto my-6 md:my-0 relative">
            <CarouselContent>
              {finalImages?.success! &&
                finalImages?.generations.map(
                  (generatedImg: any, index: any) => (
                    <CarouselItem key={index}>
                      <div className="p-1 mt-4">
                        {generatedImg && (
                          <img
                            src={`data:image/jpg;base64,${generatedImg.base64String}`}
                            className="max-w-full object-contain rounded-lg mx-auto"
                            alt="img"
                          />
                        )}
                      </div>
                    </CarouselItem>
                  )
                )}
            </CarouselContent>
            {finalImages?.success && (
              <div>
                <CarouselPrevious className="absolute top-1/2 left-3" />
                <CarouselNext className="absolute top-1/2 right-3" />
              </div>
            )}
          </Carousel>
        </CardContent>

        {jobID && imgStatus?.done === false && (
          <CardFooter className="flex flex-col my-4 gap-2">
            <div className="flex flex-row items-center justify-center gap-2">
              <p className="text-md font-semibold text-white">
                Generating Your Images
              </p>{" "}
              <span>
                <Loading />
              </span>
            </div>
            <div className="text-sm text-center">Job ID: {jobID as string}</div>
            <div className="text-sm text-center font-medium transition duration-100 linear">
              Wait Time: {imgStatus?.wait_time} seconds
            </div>
          </CardFooter>
        )}
        {/* {finalImages?.success && (
          <div className="text-white p-4 text-center font-medium m-2">
            Your images are generated
          </div>
        )} */}
      </Card>
    </div>
  );
};

export default ImageCarousel;
