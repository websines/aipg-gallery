"use client";

import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { Download, Share, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { createSupabaseClient } from '@/lib/supabase/client';

interface ImageDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: any; // The main image to display
}

const ImageDetailModal: React.FC<ImageDetailModalProps> = ({
  isOpen,
  onClose,
  image
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Reset to first image when modal opens
    setCurrentImageIndex(0);
  }, [isOpen, image]);

  const handleDownload = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  if (!image || !image.image_data || image.image_data.length === 0) return null;

  const images = image.image_data;
  const currentImage = images[currentImageIndex];
  const imageUrl = currentImage?.image_url;
  const isCloudflareUrl = imageUrl?.includes('r2.cloudflarestorage.com');

  const goToNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const selectImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl bg-zinc-900 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Image Details</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Main Image with Navigation */}
          <div className="relative aspect-square overflow-hidden rounded-lg bg-zinc-800 flex items-center justify-center">
            {isCloudflareUrl ? (
              <img 
                src={imageUrl} 
                alt={image.positive_prompt || "AI generated image"}
                className="object-contain max-h-full max-w-full"
              />
            ) : (
              <img 
                src={imageUrl} 
                alt={image.positive_prompt || "AI generated image"}
                className="object-contain max-h-full max-w-full"
              />
            )}
            
            {images.length > 1 && (
              <>
                <button 
                  onClick={goToPrevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 rounded-full p-1 hover:bg-black/70"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button 
                  onClick={goToNextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 rounded-full p-1 hover:bg-black/70"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => selectImage(index)}
                      className={`h-2 w-2 rounded-full ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          
          {/* Image Metadata */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-1">Prompt</h3>
              <p className="text-zinc-300">{image.positive_prompt}</p>
            </div>
            
            {image.negative_prompt && (
              <div>
                <h3 className="text-lg font-medium mb-1">Negative Prompt</h3>
                <p className="text-zinc-300">{image.negative_prompt}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-1">Model</h3>
                <p className="text-zinc-300">{image.model}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">Sampler</h3>
                <p className="text-zinc-300">{image.sampler}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">Guidance</h3>
                <p className="text-zinc-300">{image.guidance}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">Seed</h3>
                <p className="text-zinc-300">{currentImage?.seed || 'Unknown'}</p>
              </div>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDownload(imageUrl)}
                className="bg-zinc-800 hover:bg-zinc-700 border-zinc-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="bg-zinc-800 hover:bg-zinc-700 border-zinc-700"
              >
                <Heart className="h-4 w-4 mr-2" />
                Like
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="bg-zinc-800 hover:bg-zinc-700 border-zinc-700"
              >
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
        
        {/* Thumbnail Carousel */}
        {images.length > 1 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">All Images</h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {images.map((img, index) => (
                <div 
                  key={img.id} 
                  className={`aspect-square overflow-hidden rounded-md cursor-pointer ${
                    index === currentImageIndex ? 'ring-2 ring-indigo-500' : ''
                  }`}
                  onClick={() => selectImage(index)}
                >
                  {img.image_url?.includes('r2.cloudflarestorage.com') ? (
                    <img 
                      src={img.image_url} 
                      alt={`Thumbnail ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <img 
                      src={img.image_url} 
                      alt={`Thumbnail ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <DialogFooter className="flex justify-end">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="bg-zinc-800 hover:bg-zinc-700 border-zinc-700"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageDetailModal;
