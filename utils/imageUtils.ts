// Check if we're on the client side
const isClient = typeof window !== 'undefined';

// Helper function to infer mime type from base64 string
export const inferMimeTypeFromBase64 = (base64: string) => {
  if (base64.indexOf('data:') === 0) {
    let [data] = base64?.split(',') || ['']
    data = data.replace('data:', '')
    data = data.replace(';base64', '')
    return data
  }

  if (!isClient) return 'unknown';

  // Convert base64 string to array of integers
  const byteCharacters = atob(base64)
  const byteNumbers = new Array(byteCharacters.length)

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)

  // Check the bytes to identify the format
  if (byteArray[0] === 0xff && byteArray[1] === 0xd8 && byteArray[2] === 0xff) {
    return 'image/jpeg'
  }
  if (
    byteArray[0] === 0x89 &&
    byteArray[1] === 0x50 &&
    byteArray[2] === 0x4e &&
    byteArray[3] === 0x47
  ) {
    return 'image/png'
  }
  if (byteArray[0] === 0x47 && byteArray[1] === 0x49 && byteArray[2] === 0x46) {
    return 'image/gif'
  }
  if (byteArray[0] === 0x42 && byteArray[1] === 0x4d) {
    return 'image/bmp'
  }
  if (
    byteArray[0] === 0x38 &&
    byteArray[1] === 0x42 &&
    byteArray[2] === 0x50 &&
    byteArray[3] === 0x53
  ) {
    return 'image/psd'
  }
  if (
    byteArray[0] === 0x52 &&
    byteArray[1] === 0x49 &&
    byteArray[2] === 0x46 &&
    byteArray[3] === 0x46 &&
    byteArray[8] === 0x57 &&
    byteArray[9] === 0x45 &&
    byteArray[10] === 0x42 &&
    byteArray[11] === 0x50
  ) {
    return 'image/webp'
  }

  return 'unknown'
}

// Convert a blob to base64
export const getBase64 = (file: Blob) => {
  if (!isClient) return Promise.resolve(null);

  return new Promise((resolve) => {
    let reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      return resolve(reader.result)
    }
  })
}

// Convert base64 to a blob URL
export const base64toBlobURL = (base64String: string) => {
  if (!isClient) return '';

  try {
    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "img/jpg" });

    const url = URL.createObjectURL(blob)

    return url
  } catch (err) {
    return ''
  }
}

// Convert base64 to blob
export const base64toBlob = async (base64String: string, mimeType = 'image/png'): Promise<Blob> => {
  if (!isClient) throw new Error("base64toBlob cannot be called on the server");

  try {
    // Remove the data URL prefix if present
    const base64Data = base64String.includes('base64,') 
      ? base64String.split('base64,')[1] 
      : base64String;
      
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });

    return blob;
  } catch (err) {
    console.error("Error converting base64 to blob:", err);
    throw new Error("Failed to convert base64 to blob");
  }
}

// Check if a string is a valid base64 image URL
export const isBase64UrlImage = async (base64String: string) => {
  if (!isClient) return false;
  
  let image = new Image()
  image.src = base64String
  return await new Promise((resolve) => {
    image.onload = function () {
      if (image.height === 0 || image.width === 0) {
        resolve(false)
        return
      }
      resolve(true)
    }
    image.onerror = () => {
      resolve(false)
    }
  })
}

// Convert a data URL to a File object
export const dataUrlToFile = (
  dataUrl: string,
  filename: string
): File | undefined => {
  if (!isClient) return undefined;
  
  dataUrl = `data:image/webp;base64,` + dataUrl
  const arr = dataUrl.split(',')
  if (arr.length < 2) {
    return undefined
  }
  const mimeArr = arr[0].match(/:(.*?);/)
  if (!mimeArr || mimeArr.length < 2) {
    return undefined
  }
  const mime = mimeArr[1]
  const buff = Buffer.from(arr[1], 'base64')
  return new File([buff], filename, { type: mime })
}

// Convert a Blob object to base64 string
export const blobToBase64 = (blob: Blob): Promise<string> => {
  if (!isClient) return Promise.resolve('');
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Resize an image file to specified dimensions while preserving aspect ratio
export const resizeImage = async (
  file: File,
  maxWidth: number = 768,
  maxHeight: number = 768
): Promise<Blob | File> => {
  // Only import the browser-image-resizer on client side
  if (isClient) {
    try {
      const { readAndCompressImage } = await import('browser-image-resizer');
      
      // Configuration for the image resizer
      const config = {
        quality: 0.9,
        maxWidth,
        maxHeight,
        autoRotate: true,
        debug: false,
        mimeType: file.type,
      };
      
      const resizedImage = await readAndCompressImage(file, config);
      return resizedImage;
    } catch (error) {
      console.error('Error resizing image:', error);
      throw error;
    }
  } else {
    // Return the original file on server side
    console.warn('Image resizing attempted on server side. Returning original file.');
    return file;
  }
};

// Generate a thumbnail from a base64 string
export const generateBase64Thumbnail = async (
  base64: string,
  jobId?: string,
  maxWidth: number = 320,
  maxHeight: number = 768,
  quality: number = 0.9
) => {
  if (!isClient) {
    console.warn('Base64 thumbnail generation attempted on server side.');
    return base64;
  }
  
  let fullDataString: any;
  let file: any;

  try {
    file = dataUrlToFile(base64, `${jobId || 'image'}.webp`);
  } catch (err) {
    console.log(`dataUrlToFile error:`, err);
    return;
  }

  if (!file) return;

  try {
    const { readAndCompressImage } = await import('browser-image-resizer');
    
    const resizedImage = await readAndCompressImage(file, {
      maxHeight,
      maxWidth,
      quality
    });
    
    if (resizedImage) {
      fullDataString = await getBase64(resizedImage);
    }

    if (!fullDataString) {
      return;
    }

    const [, imgBase64String] = fullDataString.split(';base64,');
    return imgBase64String;
  } catch (err) {
    console.log(`Error generating thumbnail:`, err);
    return;
  }
} 