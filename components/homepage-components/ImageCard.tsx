"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { DownloadCloudIcon } from "lucide-react";
import { saveAs } from "file-saver";
import { blob } from "stream/consumers";
import Loading from "../misc-components/Loading";

const ImageCard = ({ photo }: any) => {
  return (
    <div className="relative mb-4 transition-all overflow-hidden break-inside-avoid group-hover:brightness-95">
      <DownloadBtn photo={photo} />
      <img
        className="w-auto h-auto max-w-full object-contain"
        height={500}
        width={500}
        src={photo.urls.regular}
        alt="img"
      />
    </div>
  );
};

function DownloadBtn({ photo }: any) {
  const [downloading, setIsDownloading] = useState(false);
  async function downloadImage(imageUrl: string, imageName: string) {
    try {
      setIsDownloading(true);
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      saveAs(blob, `${imageName}.jpg`);
    } catch (err) {
    } finally {
      setIsDownloading(false);
    }
  }
  return (
    <Button
      variant="outline"
      className="bg-black/80 top-5 rounded-full hover:bg-black/50 right-3 absolute p-2 border"
      onClick={() => downloadImage(photo.urls.regular, photo.id)}
    >
      {" "}
      {downloading ? <Loading /> : <DownloadCloudIcon className="w-4 h-4" />}
    </Button>
  );
}
export default ImageCard;
