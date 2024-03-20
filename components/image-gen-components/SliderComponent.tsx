import React, { useState, useRef } from "react";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Button } from "../ui/button";
import { Input } from "../ui/input";

function SliderWithCounter({ min, max, step = 1, ...rest }: any) {
  const [sliderValue, setSliderValue] = useState(min);

  const handleChange = (newValue: any) => {
    setSliderValue(newValue);
    console.log("sliderValue:", sliderValue, "Type:", typeof sliderValue);
  };

  const handleIncrement = () => {
    setSliderValue(Math.min(sliderValue + step, max));
  };

  const handleDecrement = () => {
    setSliderValue(Math.max(sliderValue - step, min));
  };

  return (
    <div className="flex flex-row justify-between items-center ">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Slider
              value={[sliderValue]}
              defaultValue={[min]}
              max={max}
              step={step}
              className="w-[250px] md:flex hidden"
              onValueChange={(value) => handleChange(value)}
            />
          </TooltipTrigger>
          <TooltipContent sideOffset={5}>{sliderValue}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <div className="flex flex-row gap-2 items-center justify-center">
        <Button onClick={handleIncrement} variant={"outline"} type="button">
          +
        </Button>
        <Input value={sliderValue} />
        <Button onClick={handleDecrement} variant={"outline"} type="button">
          -
        </Button>
      </div>
    </div>
  );
}

export default SliderWithCounter;
