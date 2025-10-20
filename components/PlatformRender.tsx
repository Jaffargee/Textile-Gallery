import { Platform } from "react-native"

export interface PlatformProps {
      ios?: React.ReactNode,
      android?: React.ReactNode
}

export interface PlatformRenderProps {
      platforms?: PlatformProps
}

const PlatformRender = ({ platforms }: PlatformRenderProps) => {
      return Platform.OS === "ios" ? platforms?.ios : platforms?.android;
}

export default PlatformRender;