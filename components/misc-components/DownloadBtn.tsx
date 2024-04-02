"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { DownloadCloudIcon } from "lucide-react";
import { saveAs } from "file-saver";
import Loading from "./Loading";

function DownloadBtnComponent({ photo }: any) {
  const [downloading, setIsDownloading] = useState(false);
  async function downloadImage(base64string: string, imageName: string) {
    try {
      setIsDownloading(true);
      const byteCharacters = atob(base64string);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "img/jpg" });
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
      onClick={() => downloadImage(photo.base64_string, photo.id)}
    >
      {" "}
      {downloading ? <Loading /> : <DownloadCloudIcon className="w-6 h-6" />}
    </Button>
  );
}
export default DownloadBtnComponent;
