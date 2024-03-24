"use client";

import ImageCarousel from "@/components/image-gen-components/ImageCarousel";
import ImageGenForm from "@/components/image-gen-components/ImageGenForm";
import { AlertDestructive } from "@/components/misc-components/AlertDestructive";

const page = () => {
  const user = true;
  return (
    <div className="w-full flex flex-col gap-4 items-center justify-center p-4">
      {!user && (
        <div className="md:w-[50%]">
          <AlertDestructive
            text="You need to log in to use this!"
            title="Not logged in!"
            className="bg-red-500 text-white"
          />
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full ">
        <div className="flex flex-col justify-center items-center my-8 w-full order-2 md:order-1">
          <ImageGenForm />
        </div>
        <div className="md:my-8 p-4 order-1 md:order-2">
          <ImageCarousel />
        </div>
      </div>
    </div>
  );
};

export default page;
