import supabase from "@/Backup/hooks/supabase";
import type { ImageDirProps, ImageItem } from "@/Backup/hooks/types";

class ImageService {
      private cache: Map<string, ImageItem[] | ImageDirProps[]> = new Map();
      private pendingRequests: Map<string, Promise<ImageItem[] | ImageDirProps[]>> = new Map();
      private bucketUrl: string | null = null;

      /**
       * Get bucket base URL once and cache it
       */
      private async getBucketUrl(bucketName: string): Promise<string> {
            if (this.bucketUrl) return this.bucketUrl;

            const { data } = supabase.storage.from(bucketName).getPublicUrl("");
            this.bucketUrl = data.publicUrl.replace(/\/$/, '');
            return this.bucketUrl;
      }

      /**
       * Construct image URLs without API calls
       */
      private constructImageUrls(bucketUrl: string, fileName: string) {
            const baseUrl = `${bucketUrl}/${fileName}`;
            const thumbnailUrl = `${baseUrl}?width=400&height=400&quality=75`;

            return {
                  url: baseUrl,
                  thumbnailUrl: thumbnailUrl
            };
      }

      /**
       * Fetch image directories with proper unique IDs
       */
      async fetchImageDirectories(
            bucketName: string = "gallery", 
            options: { limit?: number; offset?: number; forceRefresh?: boolean; } = {}
      ): Promise<ImageDirProps[]> {
            
            const { limit = 100, offset = 0, forceRefresh = false } = options;
            const cacheKey = `dirs:${bucketName}:${limit}:${offset}`;
            
            // Return cached data if available
            if (!forceRefresh && this.cache.has(cacheKey)) {
                  console.log("📦 Returning cached image directories");
                  return this.cache.get(cacheKey) as ImageDirProps[];
            }

            // Check for pending requests
            if (this.pendingRequests.has(cacheKey)) {
                  console.log("⏳ Request already in progress, waiting...");
                  return this.pendingRequests.get(cacheKey) as Promise<ImageDirProps[]>;
            }

            // Create new request
            const requestPromise = this._fetchImageDirInternal(bucketName, limit, offset);
            this.pendingRequests.set(cacheKey, requestPromise);

            try {
                  const image_dirs = await requestPromise;
                  this.cache.set(cacheKey, image_dirs);
                  console.log(`✅ Fetched and cached ${image_dirs.length} directories`);
                  return image_dirs;
            } finally {
                  this.pendingRequests.delete(cacheKey);
            }
      }

      /**
       * Fetch images with proper unique IDs
       */
      async fetchImages(
            bucketName: string = "gallery", 
            options: { limit?: number; offset?: number; folder?: string; forceRefresh?: boolean; } = {}
      ): Promise<ImageItem[]> {
            
            const { limit = 100, offset = 0, folder = "", forceRefresh = false } = options;
            const cacheKey = `images:${bucketName}:${folder}:${limit}:${offset}`;
            
            if (!forceRefresh && this.cache.has(cacheKey)) {
                  console.log("📦 Returning cached images");
                  return this.cache.get(cacheKey) as ImageItem[];
            }

            if (this.pendingRequests.has(cacheKey)) {
                  console.log("⏳ Request already in progress, waiting...");
                  return this.pendingRequests.get(cacheKey) as Promise<ImageItem[]>;
            }

            const requestPromise = this._fetchImagesInternal(bucketName, folder, limit, offset);
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

      /**
       * Internal fetch method - makes actual API call
       */
      private async _fetchImagesInternal(
            bucketName: string, 
            folder: string, 
            limit: number, 
            offset: number
      ): Promise<ImageItem[]> {
            console.log(`🌐 Fetching images from ${folder || 'root'}...`);

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

            const d = data.map((file) => {


                  const filePath = folder ? `${folder}/${file.name}` : file.name;
                  const { url, thumbnailUrl } = this.constructImageUrls(bucketUrl, filePath);

                  // CRITICAL: Use file.id or create unique stable ID
                  const uniqueId = file.id || `${bucketName}-${filePath}`;

                  return {
                        id: uniqueId,
                        name: file.name,
                        loaded: false,
                        title: file.name,
                        url,
                        uri: url,
                        thumbnailUrl: thumbnailUrl,
                        source: {
                              url,
                              uri: url,
                              thumbnailUrl: thumbnailUrl
                        }
                  };
            });
            return d;
      }

      /**
       * Internal fetch directories - with proper unique IDs
       */
      private async _fetchImageDirInternal(
            bucketName: string, 
            limit: number, 
            offset: number
      ): Promise<ImageDirProps[]> {
            console.log(`🌐 Fetching directories...`);
            
            const { data, error } = await supabase.storage
                  .from(bucketName)
                  .list('', { 
                        limit,
                        offset,
                        sortBy: { column: "name", order: "asc" }
                  });

            if (error) throw error;
            if (!data || data.length === 0) return [];            

            const bucketUrl = await this.getBucketUrl(bucketName);

            return data.map((file) => {
                  const { url, thumbnailUrl } = this.constructImageUrls(
                        bucketUrl, 
                        `${file.name}/default.jpeg`
                  );

                  // CRITICAL: Use file.id or create stable unique ID
                  const uniqueId = file.id || `dir-${bucketName}-${file.name}`;

                  return {
                        id: uniqueId,
                        dir_name: file.name,
                        url,
                        thumbnailUrl,
                        loaded: false
                  };
            });
      }

      /**
       * Prefetch next page
       */
      async prefetchNextPage(
            bucketName: string, 
            currentOffset: number, 
            limit: number = 30
      ): Promise<void> {
            const nextOffset = currentOffset + limit;
            this.fetchImages(bucketName, { limit, offset: nextOffset }).catch(err => {
                  console.warn("Prefetch failed:", err);
            });
      }

      /**
       * Clear cache
       */
      clearCache(): void {
            this.cache.clear();
            this.bucketUrl = null; // Also reset bucket URL
            console.log("🗑️ Cache cleared");
      }

      /**
       * Get cache size
       */
      getCacheSize(): number {
            return this.cache.size;
      }
}

// Export singleton instance
export const imageService = new ImageService();