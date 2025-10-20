import DetailsListItem from '@/Backup/components/DetailsListItem';
import { StickUploadHeroNav } from '@/Backup/components/StickHeroNav';
import useAnimatedStyleHook from '@/Backup/hooks/animatedStyle';
import { HEADER_MAX_HEIGHT } from '@/Backup/hooks/image-dimensions';
import { ImageDirProps, imageService } from '@/Backup/hooks/image-service';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import Animated from 'react-native-reanimated';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<ImageDirProps>);

const CloudDirectory = () => {

      const [images, setImages] = useState<ImageDirProps[]>([])
      const [loading, setLoading] = useState(true);

      const keyExtractor = useCallback((item: ImageDirProps) => item.id, []);

      const renderItem = useCallback(({ item }: { item: ImageDirProps }) => (
            <DetailsListItem item={item} />
      ), []);
      
      useEffect(() => {
            const fetchImages = async () => {
                  setLoading(true);
                  const imgs = await imageService.fetchImageDirectories('gallery');
                  setImages(imgs);
                  setLoading(false);
            }
            fetchImages();
      }, [])

      const { textAnimatedStyle, headerAnimatedStyle, scrollHandler, subTextAnimatedStyleAlt } = useAnimatedStyleHook();
      
      return (
            <View className='flex flex-1 items-center justify-start pt-20 gap-4 bg-white'>
                  <StickUploadHeroNav
                        tabText='Cloud Directory'
                        style={headerAnimatedStyle}
                        textStyle={textAnimatedStyle}
                        subTextStyle={subTextAnimatedStyleAlt}
                  />
                  {
                        loading ? (
                              <View className="flex-1 items-center justify-center bg-white">
                                    <ActivityIndicator size="large" color="#3b82f6" />
                              </View>
                        ) :
                        <AnimatedFlatList
                              data={images}
                              keyExtractor={keyExtractor}
                              renderItem={renderItem}
                              contentContainerStyle={{ paddingTop: HEADER_MAX_HEIGHT - 63 }}
                              className='h-full w-full relative'
                              // Performance optimizations
                              showsVerticalScrollIndicator={true}
                              onScroll={scrollHandler}
                              scrollEventThrottle={16}
                        />
                  }
            </View>
      )
}

export default CloudDirectory

