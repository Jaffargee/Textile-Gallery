import { AlbumProps, ImageProps, syncImagesProps, SyncProgress } from "@/types";
import { TGMediaRepository } from "./file-manager";
import BatchProcessor from "./batch-processor";
import DownloadManager from "./file-manager/download-manager";
import DBWithCache from "./cache-db";

const MAX_RETRIES = 3;

export default class FileSystem {

      private db: DBWithCache;

      constructor(db: DBWithCache) {
            this.db = db;
      }

      private async downloadWithRetry(image: ImageProps, downloadManager: DownloadManager, retries = MAX_RETRIES): Promise<{downloaded: boolean}> {
            for (let attempt = 1; attempt <= retries; attempt++) {
                  try {
                        return await downloadManager.downloadFile({
                              url: image.source.cloud_uri,
                              filePath: image.source.local_uri,
                              callback_fn: () => {}
                        });
                  } catch (error) {
                        if (attempt === retries) throw error;
                        console.warn(`Retry ${attempt}/${retries} for ${image.name}`);
                        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
                  }
            }
            return { downloaded: false };
      }

      async createAlbums(albums: AlbumProps[]) {
            
            if(albums.length === 0) {
                  return { fsCreated: 0, dbInserted: 0, albums: [], errors: [] };
            }

            const { created: fsAlbums, error: fsErrors } = await TGMediaRepository.createDirs(albums);

            const dbInserted: AlbumProps[] = [];
            const errors: { dir: AlbumProps; reason: unknown }[] = [];
            const dbFailures: { album: AlbumProps; error: unknown }[] = [];

            for(const failed of fsErrors ) {
                  errors.push({ dir: failed.dir, reason: failed.reason })
            }

            if (fsAlbums.length === 0) {
                  return { fsCreated: 0, dbInserted: 0, albums: [], errors: errors };
            }

            try {
                  
                  await this.db.runUnitOfWork(async (uow) => {

                        for(const album of fsAlbums) {

                              try {
                                    await uow.albumRepo.insertAlbum([
                                          album.cloud_id,
                                          album.name,
                                          album.source.local_uri,
                                          album.source.cloud_uri,
                                    ]);
      
                                    dbInserted.push(album);
                                    
                              } catch (error) {
                                    dbFailures.push({ album, error })
                              }

                        }

                        if (dbFailures.length > 0) {
                              throw new Error(`Failed to insert ${dbFailures.length}/${fsAlbums.length} albums into database`)
                        }

                  });

                  
            } catch {

                  for (const album of fsAlbums) {
                        try {
                              await TGMediaRepository.delete(album);
                        } catch (rollbackErr) {
                              errors.push({ dir: album, reason: `FS rollback failed: ${String(rollbackErr)}` });
                        }
                  }

                  for (const { album, error } of dbFailures) {
                        errors.push({ dir: album, reason: error });
                  }
      
                  return {
                        fsCreated: fsAlbums.length,
                        dbInserted: 0,
                        albums: [],
                        errors,
                  };
                  
            }

            console.log(`✅ Successfully created ${dbInserted.length} albums`);
            
            return {
                  fsCreated: fsAlbums.length,
                  dbInserted: dbInserted.length,
                  albums: dbInserted,
                  errors,
            };
      }

      async createImages({album_images, downloadManager, total_images, total_download_count, batchSize = 10, onProgress}: syncImagesProps) {

            let images_downloaded: number = 0;

            for (const [name, cloudImages] of album_images.entries()) {

                  const batchProcess = new BatchProcessor(cloudImages, batchSize);

                  await batchProcess.processInBatches(async (batch) => {

                        try {
                              const results = await Promise.allSettled((batch as ImageProps[]).map(async (image) => {

                                    console.log(image.dir_name, image.name);
                                    console.log('-----------------------------------------\n');
                                    
                                    
                                    const { downloaded } = await this.downloadWithRetry(image, downloadManager);

                                    if (downloaded) {

                                          await this.db.runUnitOfWork(async uow => {

                                                await uow.imageRepo.insertImage([image.cloud_id, image.album_id, image.name, image.source.local_uri, image.source.cloud_uri, image.size]);
                                                ++images_downloaded;

                                          })

                                          if (onProgress && typeof onProgress === 'function') {
                                                const sync_progress: SyncProgress = {
                                                      current: images_downloaded,
                                                      total: total_images as number,
                                                      albumName: name,
                                                      percentage: images_downloaded / (total_images as number) * 100,
                                                      current_batch: batchProcess.getCurrentBatch() + 1,
                                                      total_batch: batchProcess.getBatchCount(cloudImages),
                                                }
                                                onProgress(sync_progress);
                                          }

                                          return { success: true, image }
                                    }

                                    return { success: false, image };

                              }));
                              

                              // Count successful downloads
                              // const successful = results.filter(r => r.status === 'fulfilled' && r.value.success);
                              
                              // ✅ Report progress after batch

                              // Log failures
                              const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success));

                              if (failed.length > 0) {
                                    console.warn(`⚠️ ${failed.length} images failed in batch:`);
                                    
                                    // Use Promise.all to handle async operations properly
                                    const cleanupPromises = failed.map(async (result, index) => {
                                          if (result.status === 'rejected') {
                                                console.warn(`  ${index + 1}. Promise rejected:`, result.reason);
                                                // Can't access image data for rejected promises, so we can't delete
                                                return;
                                          }
                                          
                                          // For fulfilled but failed downloads
                                          const failedImage = result.value.image;
                                          console.warn(`  ${index + 1}. ${failedImage.name}:`, result.value.success);
                                          
                                          try {
                                                await TGMediaRepository.delete(failedImage); // rollback file
                                                console.log(`  🗑️ Rolled back image: ${failedImage.name}`);
                                          } catch (deleteError) {
                                                console.error(`  ❌ Failed to rollback image ${failedImage.name}:`, deleteError);
                                          }
                                    });

                                    // Wait for all cleanup operations to complete
                                    await Promise.allSettled(cleanupPromises);
                              }

                        } catch (error) {
                              try {
                                    console.log(`🗑️ Rolled back images: ${error}`);
                              } catch (error) {
                                    console.error(`⚠️ Failed to rollback images:`, error);
                                    throw error;
                              }
                        }

                  });
            }

      }

}