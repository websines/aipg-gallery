import {create} from 'zustand';

type JobIdStore = {
  jobId: string;
  setJobId: (newJobId: string) => void;
  clearJobId: () => void;
};


const useJobIdStore = create<JobIdStore>((set) => ({
  jobId: '', // Initial empty state
  setJobId: (newJobId: string) => set({ jobId: newJobId }),
  clearJobId: () => set({ jobId: '' }),
}));

export default useJobIdStore;
