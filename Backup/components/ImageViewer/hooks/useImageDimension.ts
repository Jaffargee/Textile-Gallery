
import { useEffect, useRef, useState } from "react";
import { Image, ImageURISource } from "react-native";

import { ImageItem } from "@/Backup/hooks/types";
import { Dimensions } from "../types";
import { createCache } from "../utils";

const CACHE_SIZE = 50;
const imageDimensionsCache = createCache(CACHE_SIZE);

const useImageDimensions = (image: ImageItem): Dimensions | null => {

      const isImageUnmounted = useRef(false)

      const [dimensions, setDimensions] = useState<Dimensions | null>(null);

      const getImageDimensions = (image: ImageItem): Promise<Dimensions> => {
            return new Promise((resolve) => {
                  if (typeof image == "number") {
                        const cacheKey = `${image}`;
                        let imageDimensions = imageDimensionsCache.get(cacheKey);

                        if (!imageDimensions) {
                              const { width, height } = Image.resolveAssetSource(image);
                              imageDimensions = { width, height };
                              imageDimensionsCache.set(cacheKey, imageDimensions);
                        }

                        resolve(imageDimensions);

                        return;
                  }

                  // @ts-ignore
                  if (image.uri) {
                        const source = image as ImageURISource;
                        console.log(source.uri);
                        
                        const cacheKey = source.uri as string;

                        const imageDimensions = imageDimensionsCache.get(cacheKey);

                        if (imageDimensions) {
                              resolve(imageDimensions);
                        } else {
                              // @ts-ignore
                              Image.getSizeWithHeaders(
                                    source.uri as string,
                                    source.headers as { [key: string]: string; },
                                    (width: number, height: number) => {
                                          imageDimensionsCache.set(cacheKey, { width, height });
                                          resolve({ width, height });
                                    },
                                    () => {
                                          resolve({ width: 0, height: 0 });
                                    }
                              );
                        }
                  } else {
                        resolve({ width: 0, height: 0 });
                  }
            });
      };


      useEffect(() => {
            getImageDimensions(image).then((dimensions) => {
                  if (!isImageUnmounted) {
                        setDimensions(dimensions);
                  }
            });

            return () => {
                  isImageUnmounted.current = true;
            };
      }, [image]);

      return dimensions;
};

export default useImageDimensions;