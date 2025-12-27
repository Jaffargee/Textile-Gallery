import SupabaseService from "./supabase-service";
// import { TGMediaRepository } from "./file-manager";
import DBWithCache from "./cache-db";
import { AlbumProps, ImageProps, SyncedResult, SyncProgress } from "@/types";
import DownloadManager from "./file-manager/download-manager";
import FileSystem from "./filesystem-db";
import BatchProcessor, { MapBatchProcessor } from "./batch-processor";
import Asynchronization from "./asynchronization";

export default class ImageSync {
      private supabaseService: SupabaseService;
      private downloadManager: DownloadManager;
      private dbWithCache!: DBWithCache;
      private initPromise: Promise<void> | null = null;
      private syncInProgress = false;
      private static instance: ImageSync;
      private filesystem: FileSystem;
      
      private constructor(db: DBWithCache) {
            this.supabaseService = new SupabaseService();
            this.downloadManager = new DownloadManager();
            this.filesystem = new FileSystem(db);
      }

      static async getInstance(db: DBWithCache): Promise<ImageSync> {
            if (!ImageSync.instance) {
                  ImageSync.instance = new ImageSync(db);
                  await ImageSync.instance.initialize();
            }
            return ImageSync.instance;
      }

      async initialize(): Promise<void> {
            if (this.initPromise) return this.initPromise;

            this.initPromise = (async () => {
                  try {
                        this.dbWithCache = await DBWithCache.getInstance();
                  } catch (error) {
                        console.error('❌ initialization failed:', error);
                        throw error;
                  }
            })();

            return this.initPromise;
      }

      private ensureInitialized(): void {
            if (!this.dbWithCache) {
                  throw new Error('ImageSync not initialized. Call initialize() first.');
            }
      }

      async syncImages(callback: (progress: SyncProgress) => void): Promise<SyncedResult> {
            this.ensureInitialized();
            
            if (this.syncInProgress) {
                  console.log('⚠️ Sync already in progress, skipping...');
                  return { newCount: 0, updatedCount: 0, deletedCount: 0, errors: ['Sync already in progress'], synced: false };
            }

            this.syncInProgress = true;
            let totatDownloadCount: number = 0

            try {
                  const albums = await this.dbWithCache.getAlbums() as AlbumProps[];
                  const cloud_album_images = new Map<string, ImageProps[]>();
                  const local_album_images = new Map<string, ImageProps[]>();

                  // Step 1: Fetch all album images
                  const batchProcessor = new BatchProcessor(albums, 2);
                  
                  await batchProcessor.processInBatches(async (albumBatch) => {
                        // ✅ Await the Promise.allSettled
                        await Promise.allSettled((albumBatch as AlbumProps[]).map(async (album) => {
                              try {
                                    const [cloud_images, sql_images] = await Asynchronization.withTimeout(
                                          Promise.all([
                                                this.supabaseService.fetchImages(this.supabaseService.BUCKET_NAME, album.name, album.id),
                                                this.dbWithCache!.getImages(album.id as number),
                                          ]), 30000
                                    );
                                    
                                    cloud_album_images.set(album.name, cloud_images);
                                    local_album_images.set(album.name, sql_images as ImageProps[]);
                              } catch (error) {
                                    console.log('Error fetching album images:', error);
                              }
                        }));
                  });

                  // Step 2: Process changes and download - MOVED OUTSIDE
                  const mapBatchProcess = new MapBatchProcessor<string, ImageProps[]>(cloud_album_images, 3);
                  
                  await mapBatchProcess.processInBatches(async (batch) => {
                        const downloadablesMap = new Map<string, ImageProps[]>();

                        for (const [albumName, cloud_images] of batch.entries()) {
                              const local_images = local_album_images.get(albumName) || [];

                              const changes = this.calculateChanges(
                                    new Map(cloud_images.map(img => [img.cloud_id, img])),
                                    new Map(local_images.map(img => [img.cloud_id, img]))
                              );

                              if (changes.new_.length > 0) {
                                    downloadablesMap.set(albumName, changes.new_);
                                    totatDownloadCount += changes.new_.length;
                              }
                        }

                        // ✅ Await the download operation
                        if (downloadablesMap.size > 0) {
                              await this.filesystem.createImages({
                                    album_images: downloadablesMap,
                                    downloadManager: this.downloadManager,
                                    total_images: [...downloadablesMap.values()].reduce((total, imgs) => total + imgs.length, 0),
                                    total_download_count: totatDownloadCount,
                                    batchSize: 5,
                                    onProgress: callback,
                              });
                        }
                  });

                  console.log('✅ Sync completed successfully');
                  return { synced: true }

            } catch(err) {
                  console.error('❌ Sync error:', err);
                  return { newCount: 0, updatedCount: 0, deletedCount: 0, errors: [err as string], synced: false };
            } finally {
                  this.syncInProgress = false;
            }
      }

      private calculateChanges(cloudMap: Map<string, ImageProps>, localMap: Map<string, ImageProps>) {
            const newImages: ImageProps[] = [];
            const updatedImages: ImageProps[] = [];
            const deleteImages: ImageProps[] = [];

            for (const [cloud_id, cloudImages] of cloudMap.entries()) {
                  const localAlbum = localMap.get(cloud_id);

                  if (!localAlbum) {
                        newImages.push(cloudImages as ImageProps);
                  } else if (this.hasChanges(cloudImages, localAlbum)) {
                        updatedImages.push({ ...localAlbum, ...cloudImages });
                  }
            }

            for (const [cloud_id, localAlbum] of localMap.entries()) {
                  if (!cloudMap.has(cloud_id)) deleteImages.push(localAlbum);
            }

            return { new_: newImages, updated: updatedImages, deleted: deleteImages };
      }

      private hasChanges(cloud: ImageProps, local: ImageProps): boolean {
            return (
                  cloud.size !== local.size
            );
      }

      getDbWithCache(): DBWithCache {
            this.ensureInitialized();
            return this.dbWithCache;
      }

}