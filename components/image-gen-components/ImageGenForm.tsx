"use client";
import { useEffect, useState, useTransition } from "react";
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

import { Card, CardContent } from "@/components/ui/card";

import ImageCarousel from "@/components/image-gen-components/ImageCarousel";
import ActiveJobsPanel from "@/components/image-gen-components/ActiveJobsPanel";

import fetchAvailableModels from "@/app/_api/fetchModels";
import { Model, GeneratedImage } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { transformFormData } from "@/utils/validationUtils";
import { createImage } from "@/app/_api/createImage";
import useJobIdStore from "@/stores/jobIDStore";
import { User } from "@supabase/supabase-js";
import { createSupabaseClient } from "@/lib/supabase/client";
import useImageMetadataStore from "@/stores/ImageMetadataStore";
import { LoadingSpinner } from "@/components/misc-components/LoadingSpinner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { getFinishedImage } from "@/app/_api/fetchFinishedImage";

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
  seed: z.string(),
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
  publicView: z.boolean(),
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
type MetaData = {
  positivePrompt: string;
  negativePrompt: string;
  sampler: string;
  model: string;
  guidance: number;
  publicView: boolean;
};

const ImageGeneratorComponent = ({ user }: { user: User | null }) => {
  const [generateDisabled, setGenerateDisable] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [jobID, setJob] = useState("");
  const { toast } = useToast();
  const [generationHistory, setGenerationHistory] = useState<string[]>([]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  
  // Initialize Supabase client
  const supabase = createSupabaseClient();

  const [metadata, setMetadata] = useState<MetaData>({
    positivePrompt: "",
    negativePrompt: "",
    sampler: "",
    model: "",
    guidance: 1,
    publicView: false,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      postivePrompt: "",
      negativePrompt: "",
      seed: "",
      sampler: "k_lms",
      batchSize: 1,
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
      publicView: false,
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

  useEffect(() => {
    // No need to toggle generate disabled anymore
    // Just make sure we have a user
    if (!user) {
      setGenerateDisable(true);
    }
  }, [user]);

  const updateMetadata = useImageMetadataStore(
    (state) => state.initializeMetadata
  );

  const resetForm = () => {
    form.reset({
      postivePrompt: "",
      negativePrompt: "",
      seed: "",
      sampler: "k_lms",
      batchSize: 1,
      steps: 15,
      width: 512,
      height: 512,
      guidance: 7,
      clipskip: 1,
      model: form.getValues("model"), // Keep the selected model
      karras: false,
      nsfw: false,
      hires_fix: false,
      tiling: false,
      publicView: false,
    });
  };

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to generate images",
        variant: "destructive",
      });
      return;
    }

    try {
      setGenerateDisable(true);
      
      // Update metadata in the store
      updateMetadata({
        positivePrompt: data.postivePrompt,
        negativePrompt: data.negativePrompt,
        sampler: data.sampler,
        model: data.model,
        guidance: data.guidance,
        publicView: data.publicView,
      });

      // Transform the form data for the API
      const transformedData = {
        prompt: data.postivePrompt,
        negative_prompt: data.negativePrompt,
        sampler: data.sampler,
        model: data.model,
        guidance_scale: data.guidance,
        num_images: 2,
      };

      console.log("Submitting image generation request:", transformedData);
      
      // Create the image generation job
      const response = await createImage(transformedData, user?.id);
      
      if (response.success && response.jobId) {
        console.log("Image generation job created:", response.jobId);
        setJob(response.jobId);
        
        // Show a toast notification
        toast({
          title: "Image Generation Started",
          description: "Your image is being generated. This may take a minute.",
        });
        
        // Start polling for the job status
        startPollingJobStatus(response.jobId, user.id);
      } else {
        console.error("Failed to create image generation job:", response.error);
        toast({
          title: "Error",
          description: "Failed to start image generation. Please try again.",
          variant: "destructive",
        });
        setGenerateDisable(false);
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      setGenerateDisable(false);
    }
  };

  // Handle completed jobs from the ActiveJobsPanel
  const handleJobCompleted = (jobId: string, images: GeneratedImage[]) => {
    console.log(`Job ${jobId} completed with images:`, images);
    setGeneratedImages(prev => [...images, ...prev]);
    setGenerateDisable(false);
  };

  // Start polling for job status
  const startPollingJobStatus = async (jobId: string, userId: string) => {
    console.log(`Starting to poll for job status: ${jobId}`);
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes (5s interval)
    
    const pollInterval = setInterval(async () => {
      attempts++;
      
      try {
        // Check job status
        const response = await fetch(`/api/jobs/${jobId}/status?userId=${userId}`);
        const data = await response.json();
        
        console.log(`Job ${jobId} status (attempt ${attempts}):`, data);
        
        if (data.status === 'completed' && data.result?.generations) {
          // Job completed successfully
          clearInterval(pollInterval);
          
          // Process the generated images
          const images = data.result.generations.map((gen: any) => ({
            id: gen.id,
            seed: gen.seed,
            img_url: gen.img_url
          }));
          
          handleJobCompleted(jobId, images);
          
          toast({
            title: "Image Generation Complete",
            description: "Your images have been generated successfully!",
          });
        } else if (data.status === 'failed') {
          // Job failed
          clearInterval(pollInterval);
          setGenerateDisable(false);
          
          toast({
            title: "Image Generation Failed",
            description: "Failed to generate images. Please try again.",
            variant: "destructive",
          });
        } else if (attempts >= maxAttempts) {
          // Timeout
          clearInterval(pollInterval);
          setGenerateDisable(false);
          
          toast({
            title: "Timeout",
            description: "Image generation is taking longer than expected. Check back later.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error(`Error polling job status for ${jobId}:`, error);
        
        if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          setGenerateDisable(false);
          
          toast({
            title: "Error",
            description: "Failed to check image generation status. Please try again.",
            variant: "destructive",
          });
        }
      }
    }, 5000); // Check every 5 seconds
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <Card className="bg-transparent border-0 w-full">
        <CardContent className="flex flex-col items-center justify-center w-full p-0">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) => {
                handleSubmit(data);
                // Don't reset the form immediately to avoid UI flicker
                setTimeout(() => {
                  // Keep the model selection but reset other fields
                  const currentModel = form.getValues("model");
                  form.reset({
                    ...form.getValues(),
                    postivePrompt: "",
                    negativePrompt: "",
                    seed: "",
                    model: currentModel,
                  });
                }, 500);
              })}
              className="w-full p-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left column - Main form */}
                <div className="space-y-6">
                  {/* Active Jobs Panel */}
                  {user && (
                    <div className="mb-6">
                      <ActiveJobsPanel onJobComplete={handleJobCompleted} />
                    </div>
                  )}
                  
                  {/* Prompt Section */}
                  <div className="bg-zinc-900/60 rounded-xl border border-zinc-800/60 p-5 shadow-md">
                    <h3 className="text-lg font-medium text-zinc-200 mb-4 flex items-center">
                      <span className="mr-2">✨</span> Prompt
                    </h3>
                    
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="postivePrompt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-zinc-300">Positive Prompt</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe what you want to see in the image..." 
                                className="min-h-24 bg-zinc-950/50 border-zinc-800 focus:border-purple-500 transition-colors" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="negativePrompt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-zinc-300 flex items-center gap-2">
                              Negative Prompt
                              <ToolTipComponent tooltipText="Specify what you don't want to see in the image" />
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Elements to exclude from the image..."
                                className="bg-zinc-950/50 border-zinc-800 focus:border-purple-500 transition-colors"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="seed"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-zinc-300 flex items-center gap-2">
                              Seed
                              <ToolTipComponent tooltipText="Use a specific seed for reproducible results" />
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Leave empty for random seed"
                                className="bg-zinc-950/50 border-zinc-800 focus:border-purple-500 transition-colors"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  {/* Model Selection */}
                  <div className="bg-zinc-900/60 rounded-xl border border-zinc-800/60 p-5 shadow-md">
                    <h3 className="text-lg font-medium text-zinc-200 mb-4 flex items-center">
                      <span className="mr-2">🧠</span> Model Selection
                    </h3>
                    
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="model"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-zinc-300">Model</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-zinc-950/50 border-zinc-800 focus:border-purple-500 transition-colors">
                                  <SelectValue placeholder="Select a model" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-zinc-950 border-zinc-800">
                                <SelectGroup>
                                  <SelectLabel>Available Models</SelectLabel>
                                  {models?.map((model: Model) => (
                                    <SelectItem
                                      key={model.name}
                                      value={model.name}
                                      disabled={model.count === 0}
                                    >
                                      {model.name} ({model.count} workers)
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  {/* Generate Button */}
                  <div className="flex justify-center">
                    <Button
                      type="submit"
                      disabled={isPending || !form.formState.isValid}
                      className="w-full md:w-auto px-8 py-6 text-lg font-medium bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      {isPending ? (
                        <div className="flex items-center gap-2">
                          <LoadingSpinner size="sm" />
                          <span>Generating...</span>
                        </div>
                      ) : (
                        "Generate Image"
                      )}
                    </Button>
                  </div>
                </div>
                
                {/* Right column - Advanced settings */}
                <div className="space-y-6">
                  <div className="bg-zinc-900/60 rounded-xl border border-zinc-800/60 p-5 shadow-md">
                    <h3 className="text-lg font-medium text-zinc-200 mb-4 flex items-center">
                      <span className="mr-2">⚙️</span> Advanced Settings
                    </h3>
                    
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="dimensions" className="border-zinc-800">
                        <AccordionTrigger className="text-zinc-300 hover:text-white">Dimensions</AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-2 gap-4 mt-2">
                            <FormField
                              control={form.control}
                              name="width"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-zinc-300">Width</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value.toString()}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="bg-zinc-950/50 border-zinc-800">
                                        <SelectValue placeholder="Width" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-zinc-950 border-zinc-800">
                                      <SelectItem value="512">512px</SelectItem>
                                      <SelectItem value="768">768px</SelectItem>
                                      <SelectItem value="1024">1024px</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="height"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-zinc-300">Height</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value.toString()}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="bg-zinc-950/50 border-zinc-800">
                                        <SelectValue placeholder="Height" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-zinc-950 border-zinc-800">
                                      <SelectItem value="512">512px</SelectItem>
                                      <SelectItem value="768">768px</SelectItem>
                                      <SelectItem value="1024">1024px</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="quality" className="border-zinc-800">
                        <AccordionTrigger className="text-zinc-300 hover:text-white">Quality Settings</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4 mt-2">
                            <FormField
                              control={form.control}
                              name="steps"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-zinc-300 flex items-center gap-2">
                                    Steps
                                    <ToolTipComponent tooltipText="Higher values produce more detailed images but take longer" />
                                  </FormLabel>
                                  <FormControl>
                                    <SliderWithCounter
                                      min={10}
                                      max={50}
                                      onValueChange={(value: any) => {
                                        field.onChange(value[0] || value);
                                      }}
                                      step={1}
                                      defaultValue={[field.value]}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="guidance"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-zinc-300 flex items-center gap-2">
                                    Guidance Scale
                                    <ToolTipComponent tooltipText="How closely to follow your prompt (higher = more faithful)" />
                                  </FormLabel>
                                  <FormControl>
                                    <SliderWithCounter
                                      min={1}
                                      max={20}
                                      onValueChange={(value: any) => {
                                        field.onChange(value[0] || value);
                                      }}
                                      step={0.5}
                                      defaultValue={[field.value]}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="batchSize"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-zinc-300 flex items-center gap-2">
                                    Batch Size
                                    <ToolTipComponent tooltipText="Number of images to generate at once" />
                                  </FormLabel>
                                  <FormControl>
                                    <SliderWithCounter
                                      min={1}
                                      max={4}
                                      onValueChange={(value: any) => {
                                        field.onChange(value[0] || value);
                                      }}
                                      step={1}
                                      defaultValue={[field.value]}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="sampler" className="border-zinc-800">
                        <AccordionTrigger className="text-zinc-300 hover:text-white">Sampler</AccordionTrigger>
                        <AccordionContent>
                          <FormField
                            control={form.control}
                            name="sampler"
                            render={({ field }) => (
                              <FormItem className="mt-2">
                                <FormLabel className="text-zinc-300">Sampler</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="bg-zinc-950/50 border-zinc-800">
                                      <SelectValue placeholder="Select a sampler" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-zinc-950 border-zinc-800">
                                    <SelectItem value="k_euler">k_euler</SelectItem>
                                    <SelectItem value="k_euler_ancestral">k_euler_ancestral</SelectItem>
                                    <SelectItem value="k_heun">k_heun</SelectItem>
                                    <SelectItem value="k_dpm_2">k_dpm_2</SelectItem>
                                    <SelectItem value="k_dpm_2_ancestral">k_dpm_2_ancestral</SelectItem>
                                    <SelectItem value="k_dpmpp_2s_ancestral">k_dpmpp_2s_ancestral</SelectItem>
                                    <SelectItem value="k_dpmpp_2m">k_dpmpp_2m</SelectItem>
                                    <SelectItem value="k_dpmpp_sde">k_dpmpp_sde</SelectItem>
                                    <SelectItem value="DDIM">DDIM</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="options" className="border-zinc-800">
                        <AccordionTrigger className="text-zinc-300 hover:text-white">Additional Options</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4 mt-2">
                            <FormField
                              control={form.control}
                              name="karras"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-zinc-800 p-3">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-zinc-300">Karras</FormLabel>
                                    <FormDescription className="text-xs text-zinc-500">
                                      Use Karras noise scheduling
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="hires_fix"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-zinc-800 p-3">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-zinc-300">Hires Fix</FormLabel>
                                    <FormDescription className="text-xs text-zinc-500">
                                      Improve high-resolution image quality
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="publicView"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-zinc-800 p-3">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-zinc-300">Public View</FormLabel>
                                    <FormDescription className="text-xs text-zinc-500">
                                      Allow others to see your generated images
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Image Results */}
      {jobID && (
        <div className="w-full mt-8">
          <ImageCarousel
            jobId={jobID}
            userId={user?.id}
            onImagesLoaded={(images) => setGeneratedImages(images)}
          />
        </div>
      )}
      
      {/* Display generated images from completed jobs */}
      {!jobID && generatedImages.length > 0 && (
        <div className="w-full mt-8">
          <h2 className="text-xl font-semibold mb-4">Generated Images</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generatedImages.map((image, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-zinc-800">
                {image.img_url ? (
                  <img 
                    src={image.img_url} 
                    alt={`Generated image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : image.base64String ? (
                  <img 
                    src={image.base64String} 
                    alt={`Generated image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                    <p className="text-zinc-500">Image not available</p>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2 text-xs">
                  Seed: {image.seed || 'Unknown'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGeneratorComponent;
