"use client";
import { useEffect, useState } from "react";
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

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import fetchAvailableModels from "@/app/_api/fetchModels";
import { Model } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { transformFormData } from "@/utils/validationUtils";
import useFormInputStore from "@/stores/InputStore";
import { createImage } from "@/app/_api/createImage";
import useJobIdStore from "@/stores/jobIDStore";

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
  batchSize: z.number(),
  steps: z.number(),
  width: z.number(),
  height: z.number(),
  guidance: z.number(),
  clipskip: z.number(),
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

const PostProcessorOptions: Option[] = [
  { value: "animesharp", label: "4xAnimeSharp" },
  { value: "ersgran_x4plus", label: "RealESRGAN_x4plus" },
  { value: "ersgran_x4plus_anime_6b", label: "RealESRGAN_x4plus_anime_6b" },
  { value: "strip_background", label: "Strip Background" },
];

const ImageGenForm = () => {
  const [generateDisabled, setGenerateDisable] = useState(false);
  const [jobID, setJob] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      postivePrompt: "",
      negativePrompt: "",
      sampler: "",
      batchSize: 4,
      steps: 15,
      width: 512,
      height: 512,
      guidance: 7,
      clipskip: 1,
      model: "",
      karras: false,
      nsfw: false,
      hires_fix: false,
      tiling: false,
    },
  });

  const {
    data: models,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["models"],
    queryFn: () => fetchAvailableModels(),
    refetchInterval: 60000,
  });

  // useEffect(() => {
  //   if (user) {
  //     setGenerateDisable(!generateDisabled);
  //   }
  // }, [user]);

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    const transformedData = transformFormData(data);

    const response = await createImage(transformedData);

    setJob(response.jobId!);
  };

  const setJobId = useJobIdStore((state: any) => state.setJobId);
  setJobId(jobID);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Image Generator</CardTitle>
          <CardDescription>Generate your favorite images</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="my-2 md:my-8 p-4 flex flex-col gap-4"
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
                          onChange={(value: any) => {
                            console.log("FormField - onValueChange:", value);
                            field.onChange(value);
                          }}
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
                            field.onChange([value]);
                          }}
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
                            field.onChange([value]);
                          }}
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
                            field.onChange([value]);
                          }}
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
                            field.onChange([value]);
                          }}
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
                            field.onChange([value]);
                          }}
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
                            <SelectValue placeholder="Select a Model" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[200px]">
                            <SelectGroup>
                              <SelectLabel>Available Models</SelectLabel>
                              {isLoading && (
                                <div className="p-2 text-sm">Loading...</div>
                              )}
                              {error && (
                                <div className="p-2 text-sm">
                                  Error: {error.message}
                                </div>
                              )}
                              {models?.length < 1 && (
                                <div className="p-2 text-sm">
                                  No models found
                                </div>
                              )}

                              {models?.map((model: Model, idx: any) => (
                                <SelectItem value={model?.name} key={idx}>
                                  {model?.name}
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
                        Post-Processors - DO NOT USE THIS FOR NOW
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
              <Button
                type="submit"
                className="my-8 "
                disabled={generateDisabled}
              >
                Generate images(s)
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
};

export default ImageGenForm;
