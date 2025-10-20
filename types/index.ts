import { ViewStyle } from "react-native";

type Source = {
      uri: string;
      thumbnailUri: string;
}

export interface ImageItem {
      id: string;
      name: string;
      dir_name: string,
      source: Source;
}

export interface ImageDirProps {
      id?: string;
      name?: string;
      exists?: boolean,
      no_items?: number,
      size?: number,
      source?: Source
}

export interface CardThumbnailProps {
      selected?: string[],
      item: ImageItem | ImageDirProps,
      style?: ViewStyle,
      onView?: () => void,
      onSelect?: (uri: string) => void,
}

export function isImageDir(item: any): item is ImageDirProps {
  // Check for required properties to confirm the type
  return typeof item === 'object' && item !== null && 'no_items' in item;
}