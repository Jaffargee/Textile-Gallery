// contexts/ImageSyncContext.tsx
import React, { createContext, useContext, useRef, useEffect } from 'react';
import ImageSync from '@/lib/image-sync';

interface ImageSyncContextType {
      imageSyncRef: React.MutableRefObject<ImageSync | null>;
}

const ImageSyncContext = createContext<ImageSyncContextType | null>(null);

export function ImageSyncProvider({ children }: { children: React.ReactNode }) {
      const imageSyncRef = useRef<ImageSync | null>(null);

      useEffect(() => {
            // Initialize once on app start
            ImageSync.getInstance().then(instance => {
                  imageSyncRef.current = instance;
            });
      }, []);

      return (
            <ImageSyncContext.Provider value={{ imageSyncRef }}>
                  {children}
            </ImageSyncContext.Provider>
      );
}

export function useImageSync() {
      const context = useContext(ImageSyncContext);
      if (!context) {
            throw new Error('useImageSync must be used within ImageSyncProvider');
      }
      return context.imageSyncRef;
}