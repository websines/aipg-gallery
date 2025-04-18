export type Photo = {
    url: string
}
export interface CreateImageResponse {
    statusCode?: number
    success: boolean
    jobId?: string
    status?: string
    message?: string
    kudos?: number
    error?: string
  }

  export interface GenerateResponse {
    id: string
    message?: string
    kudos?: number
  }

  export interface ImageCreateRequestType {

    
  }

  
  export interface IArtBotImageDetails {
    cfg_scale: number
    clipskip: number
    control_type?: string
    denoising_strength?: number
    dry_run?: boolean
    facefixer_strength?: number
    height: number
    hires: boolean
    image_is_control?: boolean
    img2img?: boolean
    karras: boolean
    models: Array<string>
    negative: string
    numImages: number
    post_processing: Array<string>
    prompt: string
    return_control_map?: boolean
    sampler: string
    seed: string
    source_image?: string
    source_mask?: string
    source_processing?: string
    steps: number
    stylePreset: string
    tiling: boolean
    triggers?: Array<string>
    width: number
  }
  

export interface Model {
    performance: number;
    queued: number;
    jobs: number;
    eta: number;
    type: string;
    name: string;
    count: number;
  }
  export interface GetFinishedImageAsyncReponse {
    done: boolean
    faulted: boolean
    finished: number
    generations: Array<{
      censored: boolean
      id: string
      img: string
      model: string
      seed: string
      state: string
      worker_id: string
      worker_name: string
    }>
    is_possible: boolean
    kudos: number
    processing: number
    queue_position: number
    restarted: number
    shared: boolean
    wait_time: number
    waiting: number
  }

  export interface CheckImageResponse extends CheckImageAsyncResponse {
    success: boolean
  }
  export interface CheckResponse {
    success: boolean
    message?: string
    status?: string
    finished?: number
    processing?: number
    waiting?: number
    done?: boolean
    faulted?: boolean
    wait_time?: number
    queue_position?: number
    jobId: string
  }
  export interface CreateImageAsyncResponse {
    id: string
    kudos: number
  }
  export interface IApiParams {
    prompt: string
    params: ParamsObject
    nsfw: boolean
    censor_nsfw: boolean
    trusted_workers: boolean
    models: Array<string>
    source_image?: string
    source_processing?: string
    source_mask?: string
    r2?: boolean
    replacement_filter?: boolean
    shared?: boolean
    workers?: Array<string>
    slow_workers?: boolean
    worker_blacklist?: boolean
    dry_run?: boolean
  }


  export interface ParamsObject {
    sampler_name?: string // Optional due to ControlNet
    cfg_scale: number
    height: number
    width: number
    seed?: string
    steps: number
    denoising_strength?: number
    control_type?: string
    image_is_control?: boolean
    return_control_map?: boolean
    facefixer_strength?: number
    karras: boolean
    hires_fix: boolean
    clip_skip: number
    tiling?: boolean
    post_processing: string[]
    n: number
  }


  export interface CheckImageAsyncResponse {
    done: boolean
    faulted: boolean
    finished: number
    is_possible: boolean
    kudos: number
    processing: number
    queue_position: number
    restarted: number
    wait_time: number
    waiting: number
  }
export interface IArtBotImageDetails {
    cfg_scale: number
    clipskip: number
    control_type?: string
    denoising_strength?: number
    dry_run?: boolean
    facefixer_strength?: number
    height: number
    hires: boolean
    image_is_control?: boolean
    img2img?: boolean
    karras: boolean
    
    models: Array<string>
    negative: string
    numImages: number
    post_processing: Array<string>
    prompt: string
    return_control_map?: boolean
    sampler: string
    seed: string
    source_image?: string
    source_mask?: string
    source_processing?: string
    steps: number
    stylePreset: string
    tiling: boolean
    
    triggers?: Array<string>
    width: number
  }


  export type FinishedImageResponse = {
    success: true
    status: string
    message: string
    images: GeneratedImage[]
  }

  export interface FinishedImageResponseError {
    message: string
    status: string
    success: boolean
    retryAfter?: number
    waitTime?: number
    queuePosition?: number
  }

  export interface CheckImage {
    success: boolean
    status?: string
    message?: string
    jobId?: string
    done?: boolean
    queue_position?: number
    is_possible?: boolean
    wait_time?: number
    processing?: number
    waiting?: number
    finished?: number
  }

  export interface AiHordeGeneration {
    censored: boolean
    id: string
    img: string
    model: string
    seed: string
    state: string
    worker_id: string
    worker_name: string
  }
  
  type OmittedGeneratedImageProps = 'id' | 'img' | 'state'
  export interface GeneratedImage {
    id?: string;
    base64String?: string;
    hordeImageId?: string;
    thumbnail?: string;
    censored?: boolean;
    model?: string;
    seed?: number | string;
    worker_id?: string;
    worker_name?: string;
    img_url?: string;
    error?: string;
    saved?: boolean;
  }

  export interface FormSchema {
    positivePrompt: string;
    negativePrompt: string | undefined;
    seed: string;
    sampler: string;
    batchSize: number;
    steps: number;
    width: number;
    height: number;
    guidance: number;
    clipskip: number;
    model: string;
    karras: boolean;
    nsfw: boolean;
    hires_fix: boolean;
    tiling: boolean;
    publicView: boolean;
    post_processors: string[];
    restore_faces: boolean;
    controlType: string;
    xysType: boolean;
    createVideo: boolean;
    generationMode: "text-to-image" | "image-to-image" | "inpainting";
    sourceImage?: string;
    sourceMask?: string;
    denoising_strength: number;
    multiSelect: boolean;
    multiModel: boolean;
    multiSampler: boolean;
    multiClipSkip: boolean;
    multiSteps: boolean;
    multiHiresFix: boolean;
    multiKarras: boolean;
    multiControlType: boolean;
  }

// [S] Add types for Supabase data fetching
export interface ImageDataBase {
  id: string;
  image_url: string;
  seed?: string | null;
}

export interface ImageMetadataWithImages {
  id: string;
  user_id: string;
  positive_prompt: string;
  negative_prompt?: string | null;
  sampler?: string | null;
  model?: string | null;
  guidance?: number | null;
  public_view?: boolean | null;
  created_at: string;
  image_data: ImageDataBase[]; // Array of related images
}

// [S] Define types for ImageMetadata and ImageData tables if needed elsewhere
export interface ImageMetadata {
  id: string;
  user_id: string;
  positive_prompt: string;
  negative_prompt?: string | null;
  sampler?: string | null;
  model?: string | null;
  guidance?: number | null;
  public_view?: boolean | null;
  created_at: string;
}