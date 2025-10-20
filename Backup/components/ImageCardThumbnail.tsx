import { Image as ExpoImage } from 'expo-image';
import React, { useState } from 'react';
import { Dimensions, Pressable, Text, View } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useRouter } from 'expo-router';
import type { ImageCardThumbnailProps } from '@/Backup/hooks/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GAP = 1;
const ITEM_WIDTH = (SCREEN_WIDTH - (GAP * 4)) / 3;

const ImageCardThumbnail = React.memo(function ImageCardThumbnailComponent({item, style, onView}: ImageCardThumbnailProps){

      // const router = useRouter()
      const [imageError, setImageError] = useState(false);

      if (imageError) {
            return (
                  <View style={[{ width: ITEM_WIDTH, height: ITEM_WIDTH }, style]} className="bg-gray-200 items-center justify-center">
                        <Text className="text-gray-500">Failed to load</Text>
                  </View>
            );
      }

      return (
            <View className='overflow-hidden rounded-sm bg-gray-200' style={[{ width: ITEM_WIDTH + 2, height: ITEM_WIDTH }, style]}>
                  <Pressable onPress={onView} className='flex-1 overflow-hidden'>
                        <View className='flex-1 overflow-hidden'>
                              <ExpoImage
                                    source={{uri: item?.source?.thumbnailUrl ?? item?.source?.uri }}
                                    style={{height: ITEM_WIDTH, width: '100%'}}
                                    contentFit='cover'
                                    cachePolicy={'memory-disk'}
                                    transition={300}
                                    placeholderContentFit='cover'
                                    onError={() => setImageError(true)}
                              />
                        </View>
                        {/* <View className='flex flex-1 h-full w-full absolute top-0 left-0 bg-[#11111170] z-[100]'>
                              <View className='h-[24px] w-[24px] rounded-full absolute top-2 right-2 flex flex-col items-center justify-center bg-[#007AFF] border-[2px] border border-white'>
                                    <Ionicons name="checkmark" size={20} color="white" />
                              </View>
                        </View> */}
                  </Pressable>
            </View>
      )
});

export default ImageCardThumbnail
