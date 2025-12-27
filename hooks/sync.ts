import DirectorySync from "@/lib/directory-sync";
import ImageSync from "@/lib/image-sync";
import { AlbumProps, ImageProps } from "@/types";
import Helpers from "@/utils/helpers";
import { useEffect, useState, useRef } from "react";
import { useProgress } from "./progress-context";
import { useDBContext } from "@/contexts/dbcontext";

export default function useSyncing() {

      const [albums, setAlbums] = useState<AlbumProps[]>([]);
      const [loading, setLoading] = useState<boolean>(true);
      const [syncing, setSyncing] = useState<boolean>(false);
      const [error, setError] = useState<string | null>(null);

      const { setSyncProgress } = useProgress();
      const { db } = useDBContext();
      
      // FIX 1: Use ref to prevent multiple simultaneous syncs
      const isSyncingRef = useRef(false);
      const hasInitializedRef = useRef(false);

      async function updateCaller(directorySync: DirectorySync) {
            directorySync.getDbWithCache()?.clearAllCache();
            const albumsWithImages = await directorySync.getDbWithCache()?.getAlbums();
            const albums = Helpers.constructAlbumsArray(albumsWithImages as (AlbumProps[] | ImageProps[]));   
                     
            setAlbums(albums as AlbumProps[]);
            return albums.length;
      }
      
      useEffect(() => {
            
            // FIX 2: Prevent multiple simultaneous initializations
            if (isSyncingRef.current || hasInitializedRef.current) {
                  console.log('🚫 Sync already in progress or completed, skipping...');
                  return;
            }

            async function init() {
                  
                  // Mark as syncing to prevent duplicates
                  isSyncingRef.current = true;
                  hasInitializedRef.current = true;

                  const directorySync = new DirectorySync(db);
                  const imageSync = await ImageSync.getInstance(db);

                  try {
                        setLoading(true);
                        
                        // Initialize services first
                        await directorySync.initialize();
                        
                        // Load initial albums (might be empty on first run)
                        try {
                              const initialCount = await updateCaller(directorySync);
                              console.log('📱 Loaded', initialCount, 'albums from cache');
                        } catch (err) {
                              console.warn('⚠️ No cached albums found, will sync fresh', err);
                        }
                        
                        setLoading(false);
                        
                        // Start background sync
                        setSyncing(true);
                        console.log('🔄 Starting background sync...');
                        
                        // FIX 3: Wait for directory sync to complete
                        const dirSync = await directorySync.syncDirectories();

                        if (dirSync.synced) {
                              console.log('✅ Directory sync complete');

                              // FIX 4: Update albums and wait for state to settle
                              const finalAlbums = await updateCaller(directorySync);
                              console.log('✅ Updated albums after directory sync:', finalAlbums);

                              // FIX 5: Add small delay to ensure state is updated
                              await new Promise(resolve => setTimeout(resolve, 100));

                              // Now sync images
                              console.log('🖼️ Starting image sync...');
                              const imgSynced = await imageSync.syncImages((sync_progress) => {
                                    console.log('📊 Image sync progress:', sync_progress);
                                    setSyncProgress(sync_progress);
                              });

                              if (imgSynced.synced) {
                                    console.log('✅ Image sync complete');
                                    await directorySync.syncItemsNoNumber();
                                    const imagesAlbumsSynced = await updateCaller(directorySync);
                                    console.log('✅ Final albums with images:', imagesAlbumsSynced);

                                    setSyncProgress({ total: 0, current: 0, albumName: '', percentage: 0, current_batch: 0, total_batch: 0 })
                                    // Initialize cloud sync
                                    await new Promise(resolve => setTimeout(resolve, 3000));
                                    // await initCloudSync();
                              } else {
                                    console.warn('⚠️ Image sync did not complete:', imgSynced);
                              }

                        } else {
                              console.warn('⚠️ Directory sync did not complete:', dirSync);
                        }
                        
                        // Refresh albums after sync
                        setSyncing(false);
                        isSyncingRef.current = false;

                  } catch (err) {
                        console.error('❌ Sync error:', err);
                        setError(err instanceof Error ? err.message : 'Sync failed');
                        setLoading(false);
                        setSyncing(false);
                        isSyncingRef.current = false;
                  }
            }

            init();

            // Cleanup function
            return () => {
                  console.log('🧹 Cleaning up sync hook');
                  // Don't reset hasInitializedRef here - we want to keep it true
            };

      }, [db, setSyncProgress]); // FIX 6: REMOVE albums.length from dependencies!

      return { loading, syncing, albums, error };
      
}

