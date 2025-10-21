import { create } from 'zustand';

interface AppState {
  activeAgent: string | null;
  activeWorkflow: string | null;
  setActiveAgent: (agentId: string) => void;
  setActiveWorkflow: (workflowId: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeAgent: null,
  activeWorkflow: null,
  setActiveAgent: (agentId) => set({ activeAgent: agentId }),
  setActiveWorkflow: (workflowId) => set({ activeWorkflow: workflowId }),
}));
