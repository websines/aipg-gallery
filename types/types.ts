type Photo = {
    url: string
}

interface Model {
    performance: number;
    queued: number;
    jobs: number;
    eta: number;
    type: string;
    name: string;
    count: number;
  }