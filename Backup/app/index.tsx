import Album from '@/Backup/components/Album';
import StickHeroNav from '@/Backup/components/StickHeroNav';
import useAnimatedStyleHook from '@/Backup/hooks/animatedStyle';
import { HEADER_MAX_HEIGHT } from '@/Backup/hooks/image-dimensions';
import { imageService } from '@/Backup/hooks/image-service';
import { ImageDirProps } from '@/Backup/hooks/types';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, AppState, FlatList, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';


const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<ImageDirProps>);

export default function Index() {
      const [loading, setLoading] = useState(true);
      const [images, setImages] = useState<ImageDirProps[]>([])

      const { textAnimatedStyle, headerAnimatedStyle, scrollHandler, subTextAnimatedStyleAlt } = useAnimatedStyleHook();

      const keyExtractor = useCallback((item: ImageDirProps) => item.id, []);

      const renderItem = useCallback(({ item }: { item: ImageDirProps }) => (
            <Album item={item} />
      ), []);

      useEffect(() => {
            const handleMemoryWarning = () => {
                  console.log('MemoryWarning: Clearing image cache');
                  imageService.clearCache();
            };

            const subscription = AppState.addEventListener('memoryWarning', handleMemoryWarning);

            return () => {
                  subscription.remove();
            };
      }, []);

      useEffect(() => {
            const fetchImages = async () => {
                  const startTime = performance.now();
                  setLoading(true);

                  try {
                        const imgs = await imageService.fetchImageDirectories('gallery', { limit: 15 });
                        setImages(imgs);
                        const endTime = performance.now();
                        console.log(`✅ Loaded ${imgs.length} directories in ${(endTime - startTime).toFixed(0)}ms`);
                  } catch (error) {
                        console.error('Failed to fetch directories:', error);
                  } finally {
                        setLoading(false);
                  }
            };

            console.log(headerAnimatedStyle.height ?? 300);
            

            fetchImages();
      }, [headerAnimatedStyle.height]);

      if (loading) {
            return (
                  <View className="flex-1 items-center justify-center bg-white">
                        <ActivityIndicator size="large" color="#3b82f6" />
                  </View>
            );
      }
      
      return (
            <View className='flex flex-1 h-full w-full relative bg-white'>
                  <StickHeroNav
                        no_items={images.length}
                        isPath={false}
                        tabText='Albums'
                        style={[styles.header, headerAnimatedStyle]}
                        textStyle={textAnimatedStyle}
                        subTextStyle={subTextAnimatedStyleAlt}
                  />
                  <AnimatedFlatList
                        data={images}
                        renderItem={renderItem}
                        keyExtractor={keyExtractor}
                        numColumns={3}
                        contentContainerClassName={'px-2'}
                        contentContainerStyle={{ paddingTop: HEADER_MAX_HEIGHT, gap: 8 }}
                        columnWrapperStyle={{ gap: 4 }}
                        // Performance optimizations
                        removeClippedSubviews={true}
                        showsVerticalScrollIndicator={false}
                        maxToRenderPerBatch={10}
                        updateCellsBatchingPeriod={50}
                        initialNumToRender={15}
                        windowSize={10}
                        onScroll={scrollHandler}
                        scrollEventThrottle={16}
                  />
            </View>
      )
}

const styles = StyleSheet.create({
      header: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
      }
});