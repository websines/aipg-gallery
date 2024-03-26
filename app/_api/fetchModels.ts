import {BASE_API_URL, ClientHeader} from '@/constants'

export default async function fetchAvailableModels(){
    
    try {
        const res = await fetch(`${BASE_API_URL}/status/models`, {
         
          headers: {
            'Content-Type': 'application/json',
            'Client-Agent': ClientHeader
          },
          method: 'GET'
        })

        const response = await res.json()

        return response
       

    }catch(err){
            console.log(`Error: Unable to fetch available models from AIPG Horde`)
            console.log(err)
            return []
    }
}