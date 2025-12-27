import { SyncProgress } from "@/types";
import { createContext, ReactNode, useContext, useState } from "react";

export interface ProgressContainerContextProps {
      syncProgress: SyncProgress,
      setSyncProgress: (sync_progress: SyncProgress) => void
}

type ProgressContextProps = {
      children: ReactNode
}

const ProgressContext = createContext<ProgressContainerContextProps | undefined>(undefined);

const ProgressProvider = ({ children }: ProgressContextProps) => {

      const [syncProgress, setSyncProgress] = useState<SyncProgress>({
            current: 0,
            total: 0,
            albumName: '',
            percentage: 0
      } as SyncProgress);

      return (
            <ProgressContext.Provider value={{ syncProgress, setSyncProgress }}>
                  {children}
            </ProgressContext.Provider>
      )
}

export const useProgress = () => {
      const context = useContext(ProgressContext);
      if (!context) {
            throw new Error('useProgress must be used within ProgressProvider');
      }
      return context;
}


export default ProgressProvider;