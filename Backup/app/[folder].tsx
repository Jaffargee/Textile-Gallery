import { AnimatedFlatList } from '@/Backup/components/animated-components';
import ImageCardThumbnail from '@/Backup/components/ImageCardThumbnail';
import StickHeroNav from '@/Backup/components/StickHeroNav';
import useAnimatedStyleHook from '@/Backup/hooks/animatedStyle';
import { HEADER_MAX_HEIGHT } from '@/Backup/hooks/image-dimensions';
import { imageService } from '@/Backup/hooks/image-service';
import type { ImageItem } from '@/Backup/hooks/types';
import { usePathname } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
// import ImageViewer from '@/components/ImageViewer';

export default function Index() {
      const [images, setImages] = useState<ImageItem[]>([])
      const [loading, setLoading] = useState(true);

      // const [visible, setVisible] = useState(false);

      const pathName = usePathname()?.split('/')[1];
      const { textAnimatedStyle, headerAnimatedStyle, subTextAnimatedStyleAlt, scrollHandler } = useAnimatedStyleHook();

      useEffect(() => {
            const fetchImages = async () => {
                  setLoading(true);
                  const imgs = await imageService.fetchImages('gallery', { folder: pathName, limit: 70 });
                  setImages(imgs);
                  setLoading(false);
            }
            fetchImages();
      }, [pathName])

      if (loading) {
            return (
                  <View className="flex-1 items-center justify-center bg-white">
                        <ActivityIndicator size="large" color="#3b82f6" />
                  </View>
            );
      }
      
      return (
            <View className='flex flex-1 h-full w-full relative bg-white'>
                  {/* <ImageViewer images={images} /> */}
                  <StickHeroNav 
                        no_items={images.length}
                        tabText={pathName || 'Home'}
                        style={[styles.header, headerAnimatedStyle]}
                        textStyle={textAnimatedStyle}
                        subTextStyle={subTextAnimatedStyleAlt}
                  />
                  <AnimatedFlatList
                        data={images}
                        renderItem={({ item }) => <ImageCardThumbnail key={item.id} item={item} />}
                        keyExtractor={(item) => item.id as string}
                        numColumns={3}
                        contentContainerStyle={{ paddingTop: HEADER_MAX_HEIGHT, gap: 1 }}
                        columnWrapperStyle={{ gap: 1 }}
                        // Performance optimizations
                        removeClippedSubviews={true}
                        showsVerticalScrollIndicator={false}
                        maxToRenderPerBatch={10}
                        updateCellsBatchingPeriod={50}
                        initialNumToRender={15}
                        windowSize={10}
                        onScroll={scrollHandler}
                        scrollEventThrottle={16}
                        refreshing={loading}
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