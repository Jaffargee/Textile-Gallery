import { AlbumProps } from "@/types";
import BatchProcessor from "./batch-processor";
import Cache from "./cache";
import SupabaseService from "./supabase-service";

const supabaseService = new SupabaseService();

class CloudSync {

      private cache: Cache = Cache.getInstance();;

      constructor() {
            this.loadAlbums = this.loadAlbums.bind(this);
      }

      async loadAlbums(): Promise<AlbumProps[]> {
            const cloud_albums = await supabaseService.fetchDirectories();
            this.cache.addData(`cloud-albums-{CLD800D}`, cloud_albums, 30000 * 60);
            return cloud_albums;
      }

      async runSync() {
            
            const batchProcessor = new BatchProcessor(await this.loadAlbums());

            await batchProcessor.processInBatches(async (batch) => {
                  for (const album of batch) {
                        const album_images = await supabaseService.fetchImages('gallery', album.name);
                        this.cache.addData(`cloud-${album.name}`, album_images, 30000 * 60);
                  }
            })

      }

}

export default async function initCloudSync() {

      const cloudSync = new CloudSync();

      await cloudSync.runSync();
      
}