// hooks/useAlbumPreloader.ts
import { useEffect } from 'react';
import ImageSync from '@/lib/image-sync';

export function useAlbumPreloader(currentAlbumId: number, allAlbumIds: number[]) {
      useEffect(() => {
            async function preloadAdjacentAlbums() {
                  const imageSync = await ImageSync.getInstance();
                  const currentIndex = allAlbumIds.indexOf(currentAlbumId);
                  
                  // Preload next and previous albums
                  const toPreload = [
                        allAlbumIds[currentIndex + 1],
                        allAlbumIds[currentIndex - 1],
                  ].filter(id => id !== undefined);

                  for (const albumId of toPreload) {
                        // This will populate cache in background
                        imageSync.getDbWithCache().getImages(albumId).catch(() => {
                              console.log('Preload failed for album', albumId);
                        });
                  }
            }

            preloadAdjacentAlbums();
      }, [currentAlbumId, allAlbumIds]);
}

// Usage in component:
// const allAlbumIds = [1, 2, 3, 4, 5]; // Pass from parent
// useAlbumPreloader(album_id, allAlbumIds);