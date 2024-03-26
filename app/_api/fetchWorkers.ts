import { BASE_API_URL, ClientHeader } from "@/constants"


export const fetchAvailableWorkers = async () => {


    try {
        const res = await fetch(`${BASE_API_URL}/workers`, {
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
            'Client-Agent': ClientHeader
          },
          method: 'GET'
        })
    
        const data = await res.json()

        return data
    }catch(err){
        return []
    }
}