"use client";

import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Share, Heart, ChevronLeft, ChevronRight, ImageIcon, Copy, Check, Sparkles, X } from 'lucide-react';
import { createSupabaseClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface ImageDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: any; // The main image to display
}

interface ImageData {
  id: string;
  image_url: string;
  seed?: string;
}

const ImageDetailModal: React.FC<ImageDetailModalProps> = ({
  isOpen,
  onClose,
  image
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    // Reset to first image when modal opens
    setCurrentImageIndex(0);
    setLiked(false);
  }, [isOpen, image]);

  const handleDownload = async (imageUrl: string) => {
    try {
      setLoading(true);
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
      toast.success('Image downloaded successfully');
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Error downloading image');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCopyPrompt = () => {
    if (image?.positive_prompt) {
      navigator.clipboard.writeText(image.positive_prompt)
        .then(() => {
          setCopied(true);
          toast.success('Prompt copied to clipboard');
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(err => {
          console.error('Failed to copy text: ', err);
          toast.error('Failed to copy prompt');
        });
    }
  };

  if (!image || !image.image_data || image.image_data.length === 0) return null;

  const images = image.image_data as ImageData[];
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
      <DialogContent className="max-w-5xl max-h-[90vh] md:max-h-[85vh] overflow-y-auto bg-gradient-to-b from-zinc-900 to-black border-zinc-800/50 text-white rounded-xl shadow-2xl backdrop-blur-sm p-1">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 blur opacity-50" />
        <DialogClose className="absolute right-3 top-3 md:right-4 md:top-4 rounded-full p-1.5 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/50 z-20 opacity-70 hover:opacity-100 transition-opacity">
          <X className="h-4 w-4 md:h-5 md:w-5 text-zinc-300" />
          <span className="sr-only">Close</span>
        </DialogClose>
        <div className="relative z-10 p-3 md:p-5">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400">
              Image Details
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 py-4 md:py-6">
            {/* Main Image with Navigation */}
            <div className="relative aspect-square overflow-hidden rounded-xl flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800/50 shadow-xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full flex items-center justify-center"
                >
                  {isCloudflareUrl ? (
                    <img 
                      src={imageUrl} 
                      alt={image.positive_prompt || "AI generated image"}
                      className="object-contain max-h-full max-w-full p-2 md:p-4"
                    />
                  ) : (
                    <img 
                      src={imageUrl} 
                      alt={image.positive_prompt || "AI generated image"}
                      className="object-contain max-h-full max-w-full p-2 md:p-4"
                    />
                  )}
                </motion.div>
              </AnimatePresence>
              
              {images.length > 1 && (
                <>
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={goToPrevImage}
                    className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 bg-black/60 rounded-full p-1.5 md:p-2.5 hover:bg-black/80 backdrop-blur-sm border border-white/10 shadow-lg z-20"
                  >
                    <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={goToNextImage}
                    className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 bg-black/60 rounded-full p-1.5 md:p-2.5 hover:bg-black/80 backdrop-blur-sm border border-white/10 shadow-lg z-20"
                  >
                    <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
                  </motion.button>
                  <div className="absolute bottom-2 md:bottom-4 left-0 right-0 flex justify-center gap-1.5 z-20">
                    {images.map((_, index: number) => (
                      <button
                        key={index}
                        onClick={() => selectImage(index)}
                        className={`h-2 md:h-2.5 w-2 md:w-2.5 rounded-full transition-all ${
                          index === currentImageIndex 
                            ? 'bg-white scale-110 shadow-glow' 
                            : 'bg-white/40 hover:bg-white/70'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            
            {/* Image Metadata */}
            <div className="space-y-3 md:space-y-5">
              <div className="bg-zinc-900/70 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-zinc-800/50">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-base md:text-lg font-medium text-zinc-200">Prompt</h3>
                  <motion.button 
                    onClick={handleCopyPrompt}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-zinc-400 hover:text-white"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </motion.button>
                </div>
                <p className="text-zinc-300 text-xs md:text-sm leading-relaxed">{image.positive_prompt}</p>
              </div>
              
              {image.negative_prompt && (
                <div className="bg-zinc-900/70 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-zinc-800/50">
                  <h3 className="text-base md:text-lg font-medium mb-2 text-zinc-200">Negative Prompt</h3>
                  <p className="text-zinc-300 text-xs md:text-sm leading-relaxed">{image.negative_prompt}</p>
                </div>
              )}
              
              <div className="bg-zinc-900/70 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-zinc-800/50">
                <h3 className="text-base md:text-lg font-medium mb-2 md:mb-3 text-zinc-200">Generation Details</h3>
                <div className="grid grid-cols-2 gap-x-4 md:gap-x-6 gap-y-3 md:gap-y-4">
                  <div>
                    <h4 className="text-xs font-medium text-zinc-400 mb-1">Model</h4>
                    <p className="text-zinc-300 text-xs md:text-sm flex items-center">
                      <Sparkles className="h-3 w-3 mr-1.5 text-indigo-400" />
                      {image.model || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-zinc-400 mb-1">Sampler</h4>
                    <p className="text-zinc-300 text-xs md:text-sm">{image.sampler || 'Unknown'}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-zinc-400 mb-1">Guidance</h4>
                    <p className="text-zinc-300 text-xs md:text-sm">{image.guidance || 'Unknown'}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-zinc-400 mb-1">Seed</h4>
                    <p className="text-zinc-300 text-xs md:text-sm font-mono">{currentImage?.seed || 'Unknown'}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-zinc-400 mb-1">Created</h4>
                    <p className="text-zinc-300 text-xs md:text-sm">
                      {new Date(image.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Thumbnail Carousel */}
          {images.length > 1 && (
            <div className="mt-2 bg-zinc-900/70 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-zinc-800/50">
              <h3 className="text-base md:text-lg font-medium mb-2 md:mb-3 text-zinc-200 flex items-center">
                <ImageIcon className="h-4 w-4 mr-2 text-indigo-400" />
                All Variations
              </h3>
              <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2 md:gap-3">
                {images.map((img: ImageData, index: number) => (
                  <motion.div 
                    key={img.id} 
                    className={`relative aspect-square overflow-hidden rounded-lg cursor-pointer border ${
                      index === currentImageIndex 
                        ? 'border-indigo-500 ring-2 ring-indigo-500/50' 
                        : 'border-zinc-800/50 hover:border-zinc-600'
                    }`}
                    onClick={() => selectImage(index)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
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
                    {index === currentImageIndex && (
                      <div className="absolute inset-0 bg-indigo-500/20 backdrop-blur-[1px]"></div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex flex-wrap gap-2 md:gap-3 mt-4 md:mt-6 justify-end">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="outline" 
                onClick={() => setLiked(!liked)}
                className={`bg-zinc-900/80 hover:bg-zinc-800 border-zinc-800/50 rounded-full px-3 md:px-5 py-1 h-8 md:h-10 text-xs md:text-sm ${
                  liked ? 'text-pink-500 border-pink-500/30' : 'text-white'
                }`}
              >
                <Heart className={`h-3 w-3 md:h-4 md:w-4 mr-1.5 md:mr-2 ${liked ? 'fill-pink-500' : ''}`} />
                {liked ? 'Liked' : 'Like'}
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="outline" 
                onClick={() => handleDownload(imageUrl)}
                className="bg-zinc-900/80 hover:bg-zinc-800 border-zinc-800/50 rounded-full px-3 md:px-5 py-1 h-8 md:h-10 text-xs md:text-sm flex items-center"
                disabled={loading}
              >
                {loading ? (
                  <div className="h-3 w-3 md:h-4 md:w-4 mr-1.5 md:mr-2 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <Download className="h-3 w-3 md:h-4 md:w-4 mr-1.5 md:mr-2" />
                )}
                Download
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="outline" 
                onClick={onClose}
                className="bg-zinc-900/80 hover:bg-zinc-800 border-zinc-800/50 rounded-full px-3 md:px-5 py-1 h-8 md:h-10 text-xs md:text-sm"
              >
                Close
              </Button>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageDetailModal;
