import React, { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Button } from "../ui/button";
import { Input } from "../ui/input";

function SliderWithCounter({ min, max, step = 1, onValueChange }: any) {
  const [sliderValue, setSliderValue] = useState(min);

  const handleChange = (newValue: any) => {
    setSliderValue(newValue);
    onValueChange(newValue);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      setSliderValue(newValue);
      handleChange(newValue);
    }
  };

  const handleIncrement = () => {
    setSliderValue(Math.min(sliderValue + step, max));
    handleChange(Math.min(sliderValue + step, max));
  };

  const handleDecrement = () => {
    setSliderValue(Math.max(sliderValue - step, min));
    handleChange(Math.max(sliderValue - step, min));
  };

  return (
    <div className="flex flex-row justify-between items-center gap-2 ">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger type="button">
            <Slider
              value={[sliderValue]}
              defaultValue={[min]}
              max={max}
              step={step}
              onValueChange={handleChange}
              className="w-[250px] md:flex hidden"
            />
          </TooltipTrigger>
          <TooltipContent sideOffset={5}>{sliderValue}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <div className="flex flex-row gap-2 items-center justify-center">
        <Button onClick={handleDecrement} variant={"outline"} type="button">
          -
        </Button>
        <Input
          value={sliderValue}
          className="md:w-[60px]"
          onChange={handleInput}
        />

        <Button onClick={handleIncrement} variant={"outline"} type="button">
          +
        </Button>
      </div>
    </div>
  );
}

export default SliderWithCounter;
