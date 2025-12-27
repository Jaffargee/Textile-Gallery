import { AlbumThumbProps } from '@/types';
import React from 'react';
import { Dimensions, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import ImagePressable from './ImagePressable';
import { RelativePathString, useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GAP = 2;
const ITEM_WIDTH = (SCREEN_WIDTH - (GAP * 4) - 14) / 3;

const Album = React.memo(function ImageCardThumbnailComponent({ item, selected, selectionMode, onSelect, setSelectionMode }: AlbumThumbProps){

      const card_selected = selected && selected?.filter(u => u === item.source?.local_uri).length > 0;

      const router = useRouter();

      const defaultOnPress = () => {
            if(selectionMode){
                  onSelect?.(item.source.local_uri);
            } else {
                  router.navigate(`/${item?.name}?album_id=${item.id}` as RelativePathString);
            }   
      }

      return (
            <View className='flex flex-col' style={{ width: ITEM_WIDTH }}>
                  <View className='overflow-hidden rounded-3xl border border-black relative bg-gray-100' style={{ width: ITEM_WIDTH, height: ITEM_WIDTH }}>
                        <ImagePressable 
                              uri={item.source.local_uri as string} 
                              route={`/${item?.name}?album_id=${item.id}`} 
                              onSelect={onSelect} 
                              onPress={defaultOnPress}
                              style={{ width: ITEM_WIDTH, height: ITEM_WIDTH }}
                              selectionMode={selectionMode}
                              setSelectionMode={setSelectionMode}
                        >
                              <View className='flex-1 overflow-hidden'>
                                    <ExpoImage
                                          source={{uri: item.source.thumbnail_uri }}
                                          style={{height: ITEM_WIDTH, width: '100%'}}
                                          contentFit='cover'
                                          cachePolicy={'memory-disk'}
                                          transition={100}
                                          placeholderContentFit='cover'
                                    />
                              </View>
                              {
                                    selectionMode &&
                                    <View className={`flex flex-1 h-full w-full absolute top-0 left-0 ${card_selected ? 'bg-[#11111170]' : 'bg-transparent'}  z-[100]`}>
                                          <View className={`h-[24px] w-[24px] rounded-full absolute top-2 right-2 flex flex-col items-center justify-center ${card_selected ? 'bg-[#007AFF]' : 'bg-transparent'} border-[2px] border border-white`}>
                                                {card_selected ? <Ionicons name="checkmark" size={20} color="white" /> : <View />}
                                          </View>
                                    </View>
                              }
                        </ImagePressable>
                  </View>
                  {/* Album Details */}
                  <View className='flex flex-col items-start justify-start w-full relative gap-2 px-1 py-1'>
                        <View>
                              <Text className='text-white text-md truncate flex-wrap'>{item?.name}</Text>
                              <Text className='text-white text-sm'>{item.no_items}</Text>
                        </View>
                  </View>
            </View>
      )
});

export default Album

