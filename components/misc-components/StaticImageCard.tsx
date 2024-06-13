"use client";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import StaticImagesCarousel from "./StaticImagesCarousel";

const StaticImageCard = ({ images }: { images: any[] }) => {
  if (images.length === 0) return null;
  const [thumbnail, ...carouselImages] = images;

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <div className="cursor-pointer relative rounded-sm overflow-hidden group">
            <motion.img
              src={thumbnail.image_url}
              className="w-auto h-auto object-cover rounded-sm"
              alt={thumbnail.seed}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 200 }}
            />
          </div>
        </DialogTrigger>
        <DialogContent className="md:min-w-[70%] overflow-y-scroll bg-transparent max-h-[80vh] md:max-h-[95vh] no-scrollbar backdrop-blur-md">
          <div className="p-4 flex flex-col-reverse md:flex-row bg-transparent items-center justify-center gap-6 relative backdrop-blur-lg">
            <StaticImagesCarousel images={carouselImages} />{" "}
            {/* Pass the rest of the images */}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaticImageCard;
