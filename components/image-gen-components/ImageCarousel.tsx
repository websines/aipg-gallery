import React from "react";

const ImageCarousel = () => {
  return (
    <div className="flex flex-col gap-2 items-center justify-center mt-4">
      {/* <div className="w-full p-4 items-center flex justify-center bg-blue-500 rounded-xl">
        <p className="font-medium text-lg tracking-wide">
          Your Images will be generated here
        </p>
      </div> */}
      <div className="w-full h-[512px] bg-gray-50 rounded-xl drop-shadow-sm p-2"></div>
    </div>
  );
};

export default ImageCarousel;
