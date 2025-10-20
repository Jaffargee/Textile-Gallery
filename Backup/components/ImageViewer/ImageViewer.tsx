import { ImageItem as ImgItemProps } from '@/Backup/hooks/types';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

interface ImageViewerProps {
      images: ImgItemProps[];
      imageIndex?: number;
      currentImageIndex?: number;
      keyExtractor?: (item: ImgItemProps, index: number) => string;
      HeaderComponent?: React.ComponentType<{ imageIndex: number }>;
}

const ImageViewer =  ({ images, imageIndex, currentImageIndex, HeaderComponent, keyExtractor }: ImageViewerProps) => {

      // const imageList = useRef<VirtualizedList<ImgItemProps>>(null);

      return (
            <View style={[StyleSheet.absoluteFill]} className='bg-white z-[10000]'>
                  <View className='flex flex-1 h-full w-full bg-white relative'>

                        <Animated.View className='absolute z-[100] w-full top-0 left-0 right-0'>
                              {     HeaderComponent &&
                                    React.createElement(HeaderComponent, {
                                          imageIndex: currentImageIndex ?? 0,
                                    })
                              }
                        </Animated.View>

                  </View>
            </View>
      )
}

// const ImageViewerMemo = React.memo(ImageViewer);

export default ImageViewer;