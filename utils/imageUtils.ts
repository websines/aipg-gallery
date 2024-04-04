
export const inferMimeTypeFromBase64 = (base64: string) => {
    if (base64.indexOf('data:') === 0) {
      let [data] = base64?.split(',') || ['']
      data = data.replace('data:', '')
      data = data.replace(';base64', '')
      return data
    }
  
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

  export const getBase64 = (file: Blob) => {
    return new Promise((resolve) => {
      let reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        return resolve(reader.result)
      }
    })
  }

  
export const base64toBlobURL = (base64String: string) => {
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

  export const base64toBlob = (base64String: string) => {
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

  export const isBase64UrlImage = async (base64String: string) => {
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
  export const dataUrlToFile = (
    dataUrl: string,
    filename: string
  ): File | undefined => {
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

  export const generateBase64Thumbnail = async (
    base64: string,
    jobId: string,
    maxWidth: number = 320,
    maxHeight: number = 768,
    quality: number = 0.9
  ) => {
    let fullDataString: any
    let file: any
  
    try {
      file = dataUrlToFile(base64, `${jobId}.webp`)
    } catch (err) {
      console.log(`dataUrlToFile`, dataUrlToFile)
      return
    }

    const { readAndCompressImage } = await import('browser-image-resizer')

  let resizedImage: any
  try {
    resizedImage = await readAndCompressImage(file, {
      maxHeight,
      maxWidth,
      quality
    })
  } catch (err) {
    console.log(`readAndCompressImage`, err)
    return
  }

  if (resizedImage) {
    fullDataString = await getBase64(resizedImage)
  }

  if (!fullDataString) {
    return
  }

  const [, imgBase64String] = fullDataString.split(';base64,')
  return imgBase64String

}