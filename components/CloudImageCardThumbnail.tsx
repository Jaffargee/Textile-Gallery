// components/CloudImageCardThumbnail.tsx
import { Image as ExpoImage } from 'expo-image';
import React, { useState, useMemo } from 'react';
import { Dimensions, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ImageThumbProps } from '@/types';
import ImagePressable from './ImagePressable';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GAP = 1;
const ITEM_WIDTH = (SCREEN_WIDTH - (GAP * 4)) / 3;

const CloudImageCardThumbnail = React.memo(function CloudImageCardThumbnailComponent({ 
      item, 
      selectedSet, // ✅ Changed from 'selected' array
      selectionMode, 
      style,
      onPress,
      onSelect,
      setSelectionMode 
}: ImageThumbProps) {

      const [imageError, setImageError] = useState(false);

      // ✅ O(1) lookup instead of O(n) filter
      const card_selected = useMemo(() => 
            selectedSet?.has(item.source?.cloud_uri), 
            [selectedSet, item.source?.cloud_uri]
      );      

      if (imageError) {
            return (
                  <View style={[{ width: ITEM_WIDTH, height: ITEM_WIDTH }, style]} className="bg-gray-200 items-center justify-center">
                        <Text className="text-gray-500">Failed to load</Text>
                  </View>
            );
      }

      return (
            <View className='overflow-hidden rounded-sm bg-gray-200' style={[{ width: ITEM_WIDTH + 2, height: ITEM_WIDTH }, style]}>
                  <ImagePressable 
                        uri={item.source.local_uri as string} 
                        onSelect={onSelect}
                        selectionMode={selectionMode}
                        setSelectionMode={setSelectionMode}
                        onPress={onPress}
                  >                        
                        <View className='flex-1 overflow-hidden'>
                              <ExpoImage
                                    source={{ uri: item.source?.cloud_uri }}
                                    style={{ height: ITEM_WIDTH, width: '100%' }}
                                    contentFit='cover'
                                    cachePolicy={'memory-disk'}
                                    transition={0} // ✅ Disable transition for better performance
                                    placeholderContentFit='cover'
                                    onError={() => setImageError(true)}
                              />
                        </View>
                        {selectionMode && (
                              <View className={`flex flex-1 h-full w-full absolute top-0 left-0 ${card_selected ? 'bg-[#11111170]' : 'bg-transparent'} z-[100]`}>
                                    <View className={`h-[24px] w-[24px] rounded-full absolute top-2 right-2 flex flex-col items-center justify-center ${card_selected ? 'bg-[#007AFF]' : 'bg-transparent'} border-[2px] border border-white`}>
                                          {card_selected && <Ionicons name="checkmark" size={20} color="white" />}
                                    </View>
                              </View>
                        )}
                  </ImagePressable>
            </View>
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

export default CloudImageCardThumbnail;