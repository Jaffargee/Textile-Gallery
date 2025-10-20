import { Dimensions } from "react-native";


export const HEADER_MAX_HEIGHT = 300;

export const { width } = Dimensions.get('window');
export const COLUMN_COUNT = 3;
export const IMAGE_SIZE = (width - 32) / COLUMN_COUNT;