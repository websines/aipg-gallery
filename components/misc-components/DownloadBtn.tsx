"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { DownloadCloudIcon } from "lucide-react";
import { saveAs } from "file-saver";
import Loading from "./Loading";

function DownloadBtnComponent({ photo }: any) {
  const [downloading, setIsDownloading] = useState(false);
  async function downloadImage(image_url: string, imageName: string) {
    try {
      setIsDownloading(true);
      const response = await fetch(image_url);
      const blob = await response.blob();
      saveAs(blob, `${imageName}.jpg`);
    } catch (err) {
      console.log(err);
    } finally {
      setIsDownloading(false);
    }
  }
  return (
    <Button
      variant="outline"
      className="bg-black/80 bottom-5 rounded-full hover:bg-black/50 right-3 absolute p-2 border"
      onClick={() => downloadImage(photo.image_url, photo.id)}
    >
      {" "}
      {downloading ? <Loading /> : <DownloadCloudIcon className="w-6 h-6" />}
    </Button>
  );
}
export default DownloadBtnComponent;
