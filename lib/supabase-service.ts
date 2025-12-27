import supabase from '@/hooks/supabase';
import { ImageProps, AlbumProps, ReqOptions } from '@/types';
import { Alert } from 'react-native';
import { TGMediaRepository } from './file-manager';

export default class SupabaseService {

      private cache: Map<string, ImageProps[] | AlbumProps[]> = new Map();
      private pendingRequests: Map<string, Promise<ImageProps[] | AlbumProps[]>> = new Map();
      private bucketUrl: string | null = null;
      public BUCKET_NAME = 'gallery';

      private async getBucketUrl(bucketName: string = this.BUCKET_NAME): Promise<string> {
            if (this.bucketUrl) return this.bucketUrl;

            try {
                  const { data } = supabase.storage.from(bucketName).getPublicUrl("");
                  this.bucketUrl = data.publicUrl.replace(/\/$/, '');
                  return this.bucketUrl; // https://fbklhtvmjdcftjfchqvy.supabase.co/storage/v1/object/public/gallery
            } catch (error) {
                  console.error("Failed to get bucket URL:", error);
                  Alert.alert("Error", "Failed to get bucket URL");
                  throw error;
            }
      }

      private constructImageUrls(bucketUrl: string, fileName: string) {
            const baseUrl = `${bucketUrl}/${fileName}`;

            return {
                  url: baseUrl,
            };
      }

      private async _fetchDirInternal(bucketName: string = this.BUCKET_NAME, limit: number, offset: number): Promise<AlbumProps[]> {
            console.log(`🌐 Fetching directories...`);
            
            const { data: albums, error } = await supabase.storage.from(bucketName)
                  .list('', { 
                        limit,
                        offset,
                        sortBy: { column: "name", order: "asc" }
                  });

            if (error) throw error;
            if (!albums || albums.length === 0) return [];            

            const bucketUrl = await this.getBucketUrl(bucketName);

            return albums.map((dir) => {
                  const { url } = this.constructImageUrls(bucketUrl,  `${dir.name}/`);
                  const uniqueId = `dir-${bucketName}-${dir.name}`;

                  const local_uri = TGMediaRepository.constructPath(`${TGMediaRepository.ALBUM_NAME}/${dir.name}`);

                  if (!dir.id) {
                        return {
                              cloud_id: uniqueId,
                              name: dir.name,
                              exists: true,
                              no_items: 0,
                              size: 0,
                              source: {
                                    cloud_uri: url,
                                    local_uri: local_uri
                              }
                        }  as AlbumProps;
                  }

                  return null;

            }).filter(dir => dir != null);
      }

      async fetchDirectories( bucketName: string = this.BUCKET_NAME, options: ReqOptions = {} ): Promise<AlbumProps[]> {
            
            const { limit = 100, offset = 0, forceRefresh = false } = options;
            const cacheKey = `dirs:${bucketName}:${limit}:${offset}`;
            
            // Return cached data if available
            if (!forceRefresh && this.cache.has(cacheKey)) {
                  console.log("📦 Returning cached image albums");
                  return this.cache.get(cacheKey) as AlbumProps[];
            }

            // Check for pending requests
            if (this.pendingRequests.has(cacheKey)) {
                  console.log("⏳ Request already in progress, waiting...");
                  return this.pendingRequests.get(cacheKey) as Promise<AlbumProps[]>;
            }

            // Create new request
            const requestPromise = this._fetchDirInternal(bucketName, limit, offset);
            this.pendingRequests.set(cacheKey, requestPromise);

            try {
                  const albums = await requestPromise;
                  this.cache.set(cacheKey, albums);
                  console.log(`✅ Fetched and cached ${albums.length} directories`);
                  return albums;
            } finally {
                  this.pendingRequests.delete(cacheKey);
            }
      }

      private async _fetchImagesInternal(bucketName: string, folder: string, album_id?: number, reqOption?: ReqOptions): Promise<ImageProps[]> {
            console.log(`🌐 Fetching images from ${folder || 'root'}...`);
            const { limit = 100, offset = 0 } = reqOption || {};
            const { data, error } = await supabase.storage
                  .from(bucketName)
                  .list(folder, { 
                        limit,
                        offset,
                        sortBy: { column: "name", order: "asc" }
                  });

            if (error) throw error;
            if (!data || data.length === 0) return [];

            const bucketUrl = await this.getBucketUrl(bucketName);

            return data.map((file) => {

                  const filePath = folder ? `${folder}/${file.name}` : file.name;
                  const local_uri = TGMediaRepository.constructPath(`${TGMediaRepository.ALBUM_NAME}/${filePath}/`);
                  const { url } = this.constructImageUrls(bucketUrl, filePath);

                  const uniqueId = file.id || `${bucketName}-${filePath}`;

                  if (file.id) {
                        return {
                              cloud_id: uniqueId,
                              album_id,
                              name: file.name,
                              dir_name: folder,
                              size: file.metadata.size,
                              source: {
                                    cloud_uri: url,
                                    local_uri
                              }
                        } as ImageProps;
                  }

                  return null;

            }).filter(file => file !== null);
      }

      async fetchImages(bucketName: string = "gallery", folder: string, album_id?: number, options: ReqOptions = {}): Promise<ImageProps[]> {
            
            const { limit = 100, offset = 0, forceRefresh = false } = options;
            const cacheKey = `images:${bucketName}:${folder}:${limit}:${offset}`;
            
            if (!forceRefresh && this.cache.has(cacheKey)) {
                  console.log("📦 Returning cached images");
                  return this.cache.get(cacheKey) as ImageProps[];
            }

            if (this.pendingRequests.has(cacheKey)) {
                  console.log("⏳ Request already in progress, waiting...");
                  return this.pendingRequests.get(cacheKey) as Promise<ImageProps[]>;
            }

            const requestPromise = this._fetchImagesInternal(bucketName, folder, album_id, { limit, offset });
            this.pendingRequests.set(cacheKey, requestPromise);

            try {
                  const images = await requestPromise;
                  this.cache.set(cacheKey, images);
                  console.log(`✅ Fetched and cached ${images.length} images`);
                  return images;
            } finally {
                  this.pendingRequests.delete(cacheKey);
            }
      }

      clearCache(): void {
            this.cache.clear();
            this.bucketUrl = null; // Also reset bucket URL
            console.log("🗑️ Cache cleared");
      }

      getCacheSize(): number {
            return this.cache.size;
      }


}