import SupabaseService from "./supabase-service";
import TGFileManager, { TGMediaRepository } from "./file-manager";
import * as RNFS from 'react-native-fs'
import DBWithCache from "./cache-db";
import { AlbumProps, SyncResult, SyncedResult } from "@/types";
import FileSystem from "./filesystem-db";

const fileManager = TGFileManager.getInstance();

export default class DirectorySync {
      private supabaseService: SupabaseService;
      private initPromise: Promise<void> | null = null;
      private syncInProgress = false;
      private dbWithCache: DBWithCache;
      private filesystem: FileSystem;

      constructor(db: DBWithCache) {
            this.supabaseService = new SupabaseService();
            this.dbWithCache = db;
            this.filesystem = new FileSystem(db);
      }

      private async LOG_SYSTEM_STATUS_AND_SETTINGS(): Promise<void> {
            try {
                  const rootPath = TGMediaRepository.constructPath(TGMediaRepository.ALBUM_NAME);
                  const rootExists = await RNFS.exists(rootPath);
                  if (!rootExists) console.log('❌ Root directory missing:', rootPath);
                  await fileManager.setupGallery();
            } catch (error) {
                  throw error;
            }
      }

      /**
            * Initialize the database connection (call once at app start)
      */
      async initialize(): Promise<void> {
            if (this.initPromise) return this.initPromise;

            this.initPromise = (async () => {
                  try {
                        await this.LOG_SYSTEM_STATUS_AND_SETTINGS();
                  } catch (error) {
                        throw error;
                  }
            })();

            return this.initPromise;
      }


      /**
       * Main sync method with proper error handling and performance optimizations
       */
      async syncDirectories(): Promise<SyncedResult> {

            // Prevent concurrent syncs
            if (this.syncInProgress) {
                  console.log('⚠️ Sync already in progress, skipping...');
                  return { newCount: 0, updatedCount: 0, deletedCount: 0, errors: ['Sync already in progress'], synced: false };
            }

            this.syncInProgress = true;
            const errors: string[] = [];

            try {
                  console.log("🔁 Starting directory synchronization...");
                  const startTime = Date.now();

                  // Parallel fetch with timeout
                  const [cloud_albums, sql_albums] = await Promise.race([
                        Promise.all([
                              this.supabaseService.fetchDirectories(),
                              this.dbWithCache!.getAlbums()
                        ]),
                        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Sync timeout after 30s')), 30000))
                  ]);

                  // Build lookup maps
                  const cloudMap = new Map((cloud_albums as AlbumProps[]).map(a => [a.name, a]));
                  const localMap = new Map((sql_albums as AlbumProps[]).map(a => [a.name, a]));

                  // // Single-pass diff calculation
                  const changes = this.calculateChanges(cloudMap, localMap);

                  console.log(`📊 Changes: 🟢 ${changes.new.length} new, 🟠 ${changes.updated.length} updated, 🔴 ${changes.deleted.length} deleted`);

                  // Batch database operations for performance
                  const syncResult = await this.applyChangesInBatch(changes, errors);

                  const duration = Date.now() - startTime;
                  console.log(`✅ Directory sync complete in ${duration}ms`);

                  return { ...syncResult, synced: true, errors };

            } catch (error) {
                  const errMsg = error instanceof Error ? error.message : 'Unknown error';
                  console.error('❌ Sync failed:', errMsg);
                  errors.push(errMsg);
                  return { newCount: 0, updatedCount: 0, deletedCount: 0, synced: false, errors,  };
            } finally {
                  this.syncInProgress = false;
            }
      }

      /**
       * Efficiently calculate changes in a single pass
       */
      private calculateChanges(cloudMap: Map<string, any>, localMap: Map<string, AlbumProps>) {
            const newAlbums: AlbumProps[] = [];
            const updatedAlbums: AlbumProps[] = [];
            const deletedAlbums: AlbumProps[] = [];

            // Find new + updated albums
            for (const [name, cloudAlbum] of cloudMap.entries()) {
                  const localAlbum = localMap.get(name);

                  if (!localAlbum) {
                        newAlbums.push(cloudAlbum as AlbumProps);
                  } else if (this.hasChanges(cloudAlbum, localAlbum)) {
                        updatedAlbums.push({ ...localAlbum, ...cloudAlbum });
                  }
            }

            // Find deleted albums
            for (const [name, localAlbum] of localMap.entries()) {
                  if (!cloudMap.has(name)) deletedAlbums.push(localAlbum);
            }

            return { new: newAlbums, updated: updatedAlbums, deleted: deletedAlbums };
      }

      /**
       * Check if album has meaningful changes
       */
      private hasChanges(cloud: AlbumProps, local: AlbumProps): boolean {
            return (
                  cloud.no_items !== local.no_items ||
                  cloud.size !== local.size
            );
      }

      /**
       * Apply all changes in optimized batches with transaction safety
       */
      private async applyChangesInBatch(changes: { new: AlbumProps[]; updated: AlbumProps[]; deleted: AlbumProps[]; }, errors: string[]): Promise<Omit<SyncResult, 'errors'>> {
            let newCount = 0, updatedCount = 0, deletedCount = 0;

            try {
                  // Batch inserts (parallel with concurrency limit)
                  if (changes.new.length > 0) {

                        await this.filesystem.createAlbums(changes.new).then(async ({ dbInserted, errors: err }) => {
                              newCount = dbInserted;
                              if (err.length > 0) {
                                    errors.push(`${errors.length} directories failed to create`);
                              }
                        });

                  }

                  // Batch updates
                  if (changes.updated.length > 0) {
                        const updatePromises = changes.updated.map(async album =>

                              await this.dbWithCache.runUnitOfWork(async (uow) => {

                                    await uow.albumRepo.updateAlbum([ album.cloud_id, album.name, album.source?.local_uri, album.source?.cloud_uri ], Number(album.id)).catch(err => {
                                          console.error(`Failed to update ${album.name}:`, err);
                                          return null;
                                    })

                              })

                        );

                        const results = await Promise.all(updatePromises);
                        updatedCount = results.filter(r => r !== null).length;
                  }

                  // Batch deletes
                  if (changes.deleted.length > 0) {
                        const deletePromises = changes.deleted.map(async album => {
                              const deleted = await TGMediaRepository.delete(album);
                              if(deleted != null){

                                    await this.dbWithCache.runUnitOfWork(async (uow) => {
                                          await uow.albumRepo.deleteAlbum(Number(album.id)).catch(err => {
                                                console.error(`Failed to delete ${album.name}:`, err);
                                                return null;
                                          })
                                    })
                              }
                        });

                        const results = await Promise.all(deletePromises);
                        deletedCount = results.filter(r => r !== null).length;
                  }

                  return { newCount, updatedCount, deletedCount };

            } catch (error) {
                  console.error('❌ Batch operation failed:', error);
                  throw error;
            }
      }

      async getAlbums() {
            return await this.dbWithCache?.getAlbums();
      }

      getDbWithCache(): DBWithCache | null {
            return this.dbWithCache;
      }

      async syncItemsNoNumber() {
            
            const rootPath = TGMediaRepository.constructPath(TGMediaRepository.ALBUM_NAME);

            try {
                  const rootls = await TGMediaRepository.listDir(rootPath);
      
                  for (const album of rootls) {
                        const album_name = album.path.split('/').pop();
                        const albumPath = `file://${album.path}`;
                        if (!album_name) continue;

                        const no_items = (await TGMediaRepository.listDir(albumPath)).length;
                        const size = album.size;

                        await this.dbWithCache.runUnitOfWork(async uow => {
                              await uow.albumRepo.updateNoItems([no_items, album_name]);
                              await uow.albumRepo.updateSize([size, album_name]);
                        })
                  }
                  
            } catch (error) {
                  console.error('❌ syncItemsNoNumber failed:', error);
                  throw error;
            }

      }

      /**
       * Get current sync status
       */
      getSyncStatus() {
            return {
                  initialized: this.dbWithCache !== null,
                  syncInProgress: this.syncInProgress
            };
      }
}