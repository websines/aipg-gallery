"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import Link from "next/link";

type SearchProps = {
  onChange?: React.ChangeEventHandler<HTMLInputElement> | undefined;
  value?: string | number | readonly string[] | undefined;
};
const SearchBar = ({ value, onChange }: SearchProps) => {
  const [sliderValue, setSliderValue] = useState(4);

  const handleSliderChange = (value: any) => {
    setSliderValue(value);
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4 w-full">
      <div className="flex flex-row gap-2 items-center">
        <img src="/aipg_logo.png" alt="aipowergrid" className="w-40 h-40" />
        <h1 className="text-5xl font-medium my-4">AIPG ArtGallery</h1>
      </div>
      <div className="relative w-80">
        <Search className="absolute top-0 bottom-0 w-6 h-6 my-auto text-gray-500 left-3" />
        <Input
          type="text"
          placeholder="Search"
          className="pl-12 pr-4 rounded-xl outline-blue-500 outline-1"
          onChange={onChange}
          value={value}
        />
      </div>
      <div className="flex flex-row space-x-2">
        <Button>Search</Button>
        <Link href="/generate">
          <Button variant="secondary">Generate</Button>
        </Link>
      </div>
      <div className="my-8 p-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Slider
                defaultValue={[4]}
                max={10}
                step={1}
                className="w-[100px]"
                onValueChange={(value) => handleSliderChange(value)}
              />
            </TooltipTrigger>
            <TooltipContent>{sliderValue}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default SearchBar;
