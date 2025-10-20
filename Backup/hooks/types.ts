import { ViewStyle } from "react-native";

type ImageSource = {
      url?: string;
      uri?: string;
      thumbnailUrl?: string;
}

export interface ImageItem {
      id: string;
      name?: string;
      url?: string;
      uri?: string;
      title?: string;
      width?: number;
      height?: number;
      loaded?: boolean;
      thumbnailUrl?: string;
      source?: ImageSource;
}

export interface ImageDirProps {
      id: string; // CRITICAL: Changed to required string
      dir_name?: string;
      url?: string;
      thumbnailUrl?: string;
      loaded?: boolean;
}

export interface ImageCardThumbnailProps {
      item: ImageItem,
      style?: ViewStyle,
      onView?: () => void,
      onLoad?: () => void,
}
