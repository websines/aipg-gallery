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


  export interface FinishedImageResponse {
    success: boolean
    jobId: string
    canRate: boolean
    kudos: number
    generations: Array<GeneratedImage | FinishedImageResponseError>
  }
  
  export interface FinishedImageResponseError {
    message: string
    status: string
    success: boolean
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
  export interface GeneratedImage
    extends Omit<AiHordeGeneration, OmittedGeneratedImageProps> {
    base64String: string
    hordeImageId: string
    thumbnail: string
  }