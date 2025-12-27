import DownloadManager from "@/lib/file-manager/download-manager";
import { ViewStyle } from "react-native";

type Source = {
      cloud_uri: string,
      local_uri: string,
      thumbnail_uri?: string
}

export interface ImageProps {
      id: number;
      cloud_id: string;
      album_id: number;
      name: string;
      dir_name?: string;
      size: number;
      uri?: string,
      source: Source;
      created_at: Date;
}

export interface AlbumProps {
      id: number;
      cloud_id: string;
      name: string;
      exists: boolean;
      no_items: number;
      size: number;
      thumbnail_name?: string;
      source: Source;
      created_at: Date
}

export interface CardThumbnailProps {
      selected?: string[],
      index?: number,
      style?: ViewStyle,
      selectionMode: boolean,
      setSelectionMode?: (mode: boolean) => void,
      onView?: () => void,
      onSelect?: (uri: string) => void,
      onPress?: () => void,
      selectedSet?: Set<string>; // ✅ Changed from selected: string[]
}

export interface AlbumThumbProps extends CardThumbnailProps  {
      item: AlbumProps,
}

export interface ImageThumbProps extends CardThumbnailProps  {
      item: ImageProps,
}

export interface SyncResult {
      newCount: number;
      updatedCount: number;
      deletedCount: number;
      errors: string[];
}

export type ReqOptions = {
      limit?: number,
      offset?: number,
      forceRefresh?: boolean,
      folder?: string
}

export interface SyncProgress {
      current: number;
      total: number;
      albumName: string;
      percentage: number;
      current_batch: number;
      total_batch: number;
      total_download_count?: number,
      current_global_count?: number
}

export interface syncImagesProps {
      album_images: Map<string, ImageProps[]>,
      downloadManager: DownloadManager,
      total_images: number,
      total_download_count?: number,
      batchSize?: number,
      onProgress?: (current: SyncProgress) => void // ✅ Fixed signature
}

export type SharingProgressProps = {
      progress: number,
      current: number,
      total: number,
}

export type SyncedResult = {
      newCount?: number,
      updatedCount?: number,
      deletedCount?: number,
      errors?: string[],
      synced: boolean
}