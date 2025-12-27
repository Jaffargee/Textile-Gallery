// components/ImageCardThumbnail.tsx
import { Image as ExpoImage } from 'expo-image';
import React, { useState } from 'react';
import { Dimensions, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ImageThumbProps } from '@/types';
import { Galeria } from '@nandorojo/galeria'
import ImagePressable from './ImagePressable';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GAP = 1;
const ITEM_WIDTH = (SCREEN_WIDTH - (GAP * 4)) / 3;

const ImageCardThumbnail = React.memo(function ImageCardThumbnailComponent({ 
      item,
      index,
      selectedSet, // ✅ Changed from 'selected' array
      selectionMode, 
      style,
      onSelect,
}: ImageThumbProps) {

      const [imageError, setImageError] = useState(false);
      const [selected, setSelected] = useState(false);
      

      if (imageError) {
            return (
                  <View style={[{ width: ITEM_WIDTH, height: ITEM_WIDTH }, style]} className="bg-gray-200 items-center justify-center">
                        <Text className="text-gray-500">Failed to load</Text>
                  </View>
            );
      }

      const handleSelection = () => {
            setSelected(!selected);

            if(selectedSet?.has(item.source.local_uri)) {
                  const deleted = selectedSet.delete(item.source.local_uri)
                  console.log('Deleted: ', deleted);
                  return;
            }
            selectedSet?.add(item.source.local_uri)
      }

      return (
            <Galeria.Image index={index}>
                  <View className='overflow-hidden rounded-sm bg-[rgba(0,0,0,0.6)]' style={[{ width: ITEM_WIDTH + 2, height: ITEM_WIDTH }, style]}>
                        <View className='flex-1 overflow-hidden'>
                              <ExpoImage
                                    source={{ uri: item.source?.local_uri }}
                                    style={{ height: ITEM_WIDTH, width: '100%' }}
                                    contentFit='cover'
                                    cachePolicy={'memory-disk'}
                                    transition={0} // ✅ Disable transition for better performance
                                    placeholderContentFit='cover'
                                    onError={() => setImageError(true)}
                              />
                        </View>
                        {selectionMode && (
                              <ImagePressable 
                                    uri={item.source.local_uri as string} 
                                    onSelect={onSelect}
                                    selectionMode={selectionMode}
                                    onPress={handleSelection}
                                    className={`flex flex-1 h-full w-full absolute top-0 left-0 overflow-hidden ${selected ? 'bg-[#11111170]' : 'bg-transparent'} z-[100]`}
                              >                      
                                    <View className='flex h-full w-full relative'>
                                          <View className={`h-[24px] w-[24px] rounded-full absolute top-2 right-2 flex flex-col items-center justify-center ${selected ? 'bg-[#007AFF]' : 'bg-transparent'} border-[2px] border border-white`}>
                                                {selected && <Ionicons name="checkmark" size={20} color="white" />}
                                          </View>
                                    </View>
                              </ImagePressable>
                        )}
                  </View>
            </Galeria.Image>
      );
}, (prev, next) => {
      // ✅ Only re-render if THIS item's selection state changes
      const prevSelected = prev.selectedSet?.has(prev.item.source?.local_uri);
      const nextSelected = next.selectedSet?.has(next.item.source?.local_uri);
      
      return (
            prev.item.id === next.item.id &&
            prevSelected === nextSelected &&
            prev.selectionMode === next.selectionMode
      );
});

export default ImageCardThumbnail;