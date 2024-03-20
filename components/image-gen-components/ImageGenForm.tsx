"use client";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import { Slider } from "@/components/ui/slider";
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

const ImageGenForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      postivePrompt: "",
      negativePrompt: "",
      sampler: "",
      batchSize: [1],
      steps: [15],
      width: [512],
      height: [512],
      guidance: [7],
      clipskip: [10],
    },
  });

  const [batchSize, setBatchSize] = useState([1]);

  const handleSubmit = () => {};

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="my-8 p-4 w-[60%] flex flex-col gap-2"
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
                        setBatchSize([value]);
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
                        setBatchSize([value]);
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
                        setBatchSize([value]);
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
                        setBatchSize([value]);
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
                        setBatchSize([value]);
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
          <Button type="submit" className="my-8 ">
            Generate
          </Button>
        </form>
      </Form>
    </>
  );
};

export default ImageGenForm;
