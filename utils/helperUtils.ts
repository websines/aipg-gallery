export const formatSeconds = (time: number) => {
    time = Number(time)
  
    if (time === 0) {
      return '0s'
    }
  
    const d = Math.floor(time / 86400)
    const h = Math.floor((time % 86400) / 3600)
    const m = Math.floor(((time % 86400) % 3600) / 60)
  
    const days = d > 0 ? d + 'd ' : ''
    const hours = h > 0 ? h + 'h ' : ''
    const mins = m > 0 ? m + 'm ' : ''
  
    return days + hours + mins
  }
  
  export const randomPropertyName = function (obj: any = {}) {
    const keys = Object.keys(obj)
    return keys[Math.floor(Math.random() * keys.length)]
  }
  
  export const objIsEmpty = (obj: object) => {
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) return false
    }
    return true
  }
  
  export const toBool = (value?: string | null) => {
    if (value === 'true' || value === 'True') {
      return true
    } else {
      return false
    }
  }
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

  export const base64toBlob = async (base64Data: string) => {
    try {
      const base64str = `data:${inferMimeTypeFromBase64(
        base64Data
      )};base64,${base64Data}`
      const base64Response = await fetch(base64str)
      const blob = await base64Response.blob()
  
      return blob
    } catch (err) {
      return ''
    }
  }
  export function blobToBase64(data: Blob | File) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
      reader.readAsDataURL(data)
    })
  }
  
  export const isEmptyObject = (obj: object) => {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        return false
      }
    }
    return true
  }