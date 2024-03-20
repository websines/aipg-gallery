"use client";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import MultipleSelector, { Option } from "@/components/ui/multiple-selector";
import { Switch } from "@/components/ui/switch";
import { toast, useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import ToolTipComponent from "./ToolTipComponent";
import SliderWithCounter from "./SliderComponent";

const optionSchema = z.object({
  label: z.string(),
  value: z.string(),
  disable: z.boolean().optional(),
});

const formSchema = z.object({
  postivePrompt: z.string().min(1, {
    message: "Prompt cannot be empty",
  }),
  negativePrompt: z.string(),
  sampler: z.string(),
  batchSize: z.array(z.number()),
  steps: z.array(z.number()),
  width: z.array(z.number()),
  height: z.array(z.number()),
  guidance: z.array(z.number()),
  clipskip: z.array(z.number()),
  model: z.string(),
  postprocessors: z.array(optionSchema).optional(),
  karras: z.boolean().optional(),
  hires_fix: z.boolean().optional(),
  tiling: z.boolean().optional(),
  nsfw: z.boolean().optional(),
});

const samplerListLite = [
  "k_lms",
  "k_heun",
  "k_euler",
  "k_euler_a",
  "k_dpm_2",
  "k_dpm_2_a",
  "DDIM",
];
const dpmSamplers = [
  "k_dpm_fast",
  "k_dpm_adaptive",
  "k_dpmpp_2m",
  "k_dpmpp_2s_a",
  "k_dpmpp_sde",
];

const models = ["stable diffusion"];

const PostProcessorOptions: Option[] = [
  { value: "animesharp", label: "4xAnimeSharp" },
  { value: "ersgran_x4plus", label: "RealESRGAN_x4plus" },
  { value: "ersgran_x4plus_anime_6b", label: "RealESRGAN_x4plus_anime_6b" },
  { value: "strip_background", label: "Strip Background" },
];

const ImageGenForm = () => {
  const [batchSize, setBatchSize] = useState([1]);
  const [steps, setSteps] = useState([15]);
  const [width, setWidth] = useState([512]);
  const [height, setHeight] = useState([512]);
  const [guidance, setGuidance] = useState([7]);
  const [clipskip, setClipSkip] = useState([1]);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      postivePrompt: "",
      negativePrompt: "",
      sampler: "",
      batchSize: [],
      steps: [],
      width: [],
      height: [],
      guidance: [],
      clipskip: [],
      model: "",
      karras: false,
      nsfw: false,
      hires_fix: false,
      tiling: false,
    },
  });

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    console.log(JSON.stringify(data));
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="my-8 p-4 md:w-[60%] w-[80%] flex flex-col gap-2"
        >
          <FormField
            control={form.control}
            name="postivePrompt"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Prompt</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="negativePrompt"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel className="flex flex-row items-center gap-2">
                    Negative Prompt{" "}
                    <ToolTipComponent tooltipText="Exclude stuff from your image" />
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="negative prompts.." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="sampler"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel className="flex flex-row items-center gap-2">
                    Sampler
                    <ToolTipComponent tooltipText="Your Sampler" />
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a sampler" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px]">
                        <SelectGroup>
                          <SelectLabel>Sampler Lite</SelectLabel>
                          {samplerListLite.map((list, idx) => (
                            <SelectItem value={list} key={idx}>
                              {list}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>DPM Samplers</SelectLabel>
                          {dpmSamplers.map((list, idx) => (
                            <SelectItem value={list} key={idx}>
                              {list}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <FormField
            control={form.control}
            name="batchSize"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel className="flex flex-row items-center gap-2">
                    Batch size
                    <ToolTipComponent tooltipText="Number of images" />
                  </FormLabel>
                  <FormControl>
                    <SliderWithCounter
                      min={1}
                      max={20}
                      onValueChange={(value: any) => {
                        setBatchSize([value]);
                        field.onChange(value);
                      }}
                      value={batchSize}
                      step={1}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="steps"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel className="flex flex-row items-center gap-2">
                    Steps
                    <ToolTipComponent tooltipText="Steps" />
                  </FormLabel>
                  <FormControl>
                    <SliderWithCounter
                      min={1}
                      max={50}
                      onValueChange={(value: any) => {
                        setSteps([value]);
                        field.onChange([value]);
                      }}
                      value={batchSize}
                      step={1}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="width"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel className="flex flex-row items-center gap-2">
                    Width
                    <ToolTipComponent tooltipText="Width" />
                  </FormLabel>
                  <FormControl>
                    <SliderWithCounter
                      min={64}
                      max={1024}
                      onValueChange={(value: any) => {
                        setWidth([value]);
                        field.onChange([value]);
                      }}
                      value={batchSize}
                      step={64}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="height"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel className="flex flex-row items-center gap-2">
                    Height
                    <ToolTipComponent tooltipText="Height" />
                  </FormLabel>
                  <FormControl>
                    <SliderWithCounter
                      min={64}
                      max={1024}
                      onValueChange={(value: any) => {
                        setHeight([value]);
                        field.onChange([value]);
                      }}
                      value={batchSize}
                      step={64}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="guidance"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel className="flex flex-row items-center gap-2">
                    Guidance
                    <ToolTipComponent tooltipText="Guidance" />
                  </FormLabel>
                  <FormControl>
                    <SliderWithCounter
                      min={1}
                      max={24}
                      onValueChange={(value: any) => {
                        setGuidance([value]);
                        field.onChange([value]);
                      }}
                      value={batchSize}
                      step={0.5}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="clipskip"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel className="flex flex-row items-center gap-2">
                    Clip Skip
                    <ToolTipComponent tooltipText="Clip Skip" />
                  </FormLabel>
                  <FormControl>
                    <SliderWithCounter
                      min={1}
                      max={10}
                      onValueChange={(value: any) => {
                        setClipSkip([value]);
                        field.onChange([value]);
                      }}
                      value={batchSize}
                      step={1}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <FormField
            control={form.control}
            name="model"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel className="flex flex-row items-center gap-2">
                    Model
                    <ToolTipComponent tooltipText="Image Generating Model" />
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a sampler" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px]">
                        <SelectGroup>
                          <SelectLabel>Sampler Lite</SelectLabel>
                          {models.map((list, idx) => (
                            <SelectItem value={list} key={idx}>
                              {list}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="postprocessors"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel className="flex flex-row items-center gap-2">
                    Post-Processors
                    <ToolTipComponent tooltipText="Image Generating Model" />
                  </FormLabel>
                  <FormControl>
                    <MultipleSelector
                      selectFirstItem={false}
                      defaultOptions={PostProcessorOptions}
                      hidePlaceholderWhenSelected
                      placeholder="Select one or more pre-processors"
                      emptyIndicator={
                        <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                          no results found.
                        </p>
                      }
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
            <FormField
              control={form.control}
              name="karras"
              render={({ field }) => {
                return (
                  <FormItem className="flex flex-row items-center justify-start gap-2">
                    <FormLabel className="flex flex-row items-center gap-1 mt-2">
                      Karras
                      <ToolTipComponent tooltipText="Karras" />
                    </FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <FormField
              control={form.control}
              name="hires_fix"
              render={({ field }) => {
                return (
                  <FormItem className="flex flex-row items-center justify-start gap-2">
                    <FormLabel className="flex flex-row items-center gap-1 mt-2">
                      Hi-res Fix
                      <ToolTipComponent tooltipText="Hi-res fix" />
                    </FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <FormField
              control={form.control}
              name="nsfw"
              render={({ field }) => {
                return (
                  <FormItem className="flex flex-row items-center justify-start gap-2">
                    <FormLabel className="flex flex-row items-center gap-1 mt-2">
                      NSFW
                      <ToolTipComponent tooltipText="NSFW" />
                    </FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <FormField
              control={form.control}
              name="tiling"
              render={({ field }) => {
                return (
                  <FormItem className="flex flex-row items-center justify-start gap-2">
                    <FormLabel className="flex flex-row items-center gap-1 mt-2">
                      Tiling
                      <ToolTipComponent tooltipText="tiling" />
                    </FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>
          <Button type="submit" className="my-8 ">
            Generate
          </Button>
        </form>
      </Form>
    </>
  );
};

export default ImageGenForm;
