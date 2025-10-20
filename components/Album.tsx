import { CardThumbnailProps } from '@/types';
import { RelativePathString, useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Pressable, Text, View } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GAP = 2;
const ITEM_WIDTH = (SCREEN_WIDTH - (GAP * 4) - 14) / 3;

const Album = React.memo(function ImageCardThumbnailComponent({ item }: CardThumbnailProps){
      const router = useRouter()
      return (
            <View className='flex flex-col' style={{ width: ITEM_WIDTH }}>
                  <View className='overflow-hidden rounded-3xl border border-gray-100 relative bg-gray-100' style={{ width: ITEM_WIDTH, height: ITEM_WIDTH }}>
                        <Pressable className='flex-1 overflow-hidden' onPress={() => router.navigate('/' + item?.name as RelativePathString)}>
                              <View className='flex-1 overflow-hidden'>
                                    <ExpoImage
                                          source={{uri: item.source?.thumbnailUri }}
                                          style={{height: ITEM_WIDTH, width: '100%'}}
                                          contentFit='cover'
                                          cachePolicy={'memory-disk'}
                                          transition={100}
                                          placeholderContentFit='cover'
                                    />
                              </View>
                              {/* <View className='flex flex-1 h-full w-full absolute top-0 left-0 bg-[#11111170] z-[100]'>
                                    <View className='h-[24px] w-[24px] rounded-full absolute top-2 right-2 flex flex-col items-center justify-center bg-[#007AFF] border-[2px] border border-white'>
                                          <Ionicons name="checkmark" size={20} color="white" />
                                    </View>
                              </View> */}
                        </Pressable>
                  </View>
                  {/* Album Details */}
                  <View className='flex flex-col items-start justify-start w-full relative gap-2 px-1 py-1'>
                        <View>
                              <Text className='text-gray-700 text-md truncate flex-wrap'>{item?.name}</Text>
                              <Text className='text-gray-500 text-sm'>{'no_items' in item && item.no_items}</Text>
                        </View>
                  </View>
            </View>
      )
});

export default Album

