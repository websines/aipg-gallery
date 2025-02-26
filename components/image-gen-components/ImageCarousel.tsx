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
import { Button } from "../ui/button";
import { GeneratedImage } from "@/types";

interface ImageCarouselProps {
  jobId: string;
  userId?: string;
  onImagesLoaded?: (images: GeneratedImage[]) => void;
}

const ImageCarousel = ({ jobId, userId, onImagesLoaded }: ImageCarouselProps) => {
  const { toast } = useToast();
  const metadata = useImageMetadataStore((state) => state.metadata);
  const resetMetadata = useImageMetadataStore((state) => state.resetMetadata);
  const addImg = useImageMetadataStore((state) => state.addImage);

  const [images, setImages] = useState<any>(null);
  const [finalImages, setFinalImages] = useState<any>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isPolling, setIsPolling] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Polling function to check image status
  const pollImageStatus = async () => {
    if (!jobId || isComplete) return;

    setIsPolling(true);
    try {
      const result = await getFinishedImage(jobId, userId);
      
      if (result.success && result.images) {
        // We have our images
        setGeneratedImages(result.images);
        setIsComplete(true);
        
        // Notify parent component if callback provided
        if (onImagesLoaded) {
          onImagesLoaded(result.images);
        }
        
        // Save images if user is logged in
        if (userId && metadata) {
          await saveImagesToDatabase(result.images);
        }
      } else {
        // If still processing, continue polling
        setTimeout(pollImageStatus, 3000);
      }
    } catch (error) {
      console.error("Error polling for image status:", error);
      // Retry after a delay
      setTimeout(pollImageStatus, 5000);
    } finally {
      setIsPolling(false);
    }
  };

  // Save images to database
  const saveImagesToDatabase = async (images: GeneratedImage[]) => {
    if (!userId || !metadata || images.length === 0) return;
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      // First save metadata
      const metadataResult = await saveMetadata({
        positive_prompt: metadata.positivePrompt,
        negative_prompt: metadata.negativePrompt || "",
        sampler: metadata.sampler,
        model: metadata.model,
        guidance: metadata.guidance,
        public_view: metadata.publicView,
        user_id: userId,
      });
      
      if (!metadataResult.success) {
        throw new Error("Failed to save metadata");
      }
      
      const metadataId = metadataResult.id;
      
      // Then save each image
      const savePromises = images.map(async (image) => {
        const imageUrl = image.img_url || image.base64String;
        if (!imageUrl) return null;
        
        return saveImageData({
          image_url: imageUrl,
          seed: image.seed || "",
          metadata_id: metadataId,
        });
      });
      
      const results = await Promise.all(savePromises);
      const failedSaves = results.filter(r => !r || !r.success).length;
      
      if (failedSaves > 0) {
        toast({
          title: "Warning",
          description: `${failedSaves} images failed to save to your gallery.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Images saved to your gallery!",
        });
      }
    } catch (error) {
      console.error("Error saving images:", error);
      setSaveError("Failed to save images to your gallery. Please try again later.");
      toast({
        title: "Error",
        description: "Failed to save images to your gallery.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Start polling when component mounts
  useEffect(() => {
    if (jobId) {
      pollImageStatus();
    }
  }, [jobId]);

  if (!jobId) {
    return null;
  }

  return (
    <div className="w-full">
      {isPolling && !isComplete && (
        <div className="flex flex-col items-center justify-center py-10">
          <Loading text="Generating your images..." />
          <p className="text-sm text-zinc-400 mt-4">
            This may take a moment. Please don't refresh the page.
          </p>
        </div>
      )}

      {isComplete && generatedImages.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Generated Images</h2>
          
          <Carousel className="w-full">
            <CarouselContent>
              {generatedImages.map((image, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <Card className="overflow-hidden border-zinc-800 bg-zinc-900/60">
                      <CardContent className="p-0 aspect-square relative">
                        {image.img_url ? (
                          <img 
                            src={image.img_url} 
                            alt={`Generated image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : image.base64String ? (
                          <img 
                            src={image.base64String} 
                            alt={`Generated image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                            <p className="text-zinc-500">Image not available</p>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="p-3 bg-zinc-900/80">
                        <div className="w-full text-xs text-zinc-400">
                          <p>Seed: {image.seed || 'Unknown'}</p>
                        </div>
                      </CardFooter>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
          
          {saveError && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mt-4">
              <p className="text-red-300 text-sm">{saveError}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;
