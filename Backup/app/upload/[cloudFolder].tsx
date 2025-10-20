import { AnimatedFlatList } from '@/Backup/components/animated-components';
import ImageCardThumbnail from '@/Backup/components/ImageCardThumbnail';
import StickHeroNav from '@/Backup/components/StickHeroNav';
import useAnimatedStyleHook from '@/Backup/hooks/animatedStyle';
import { HEADER_MAX_HEIGHT } from '@/Backup/hooks/image-dimensions';
import { ImageItem, imageService } from '@/Backup/hooks/image-service';
import { usePathname } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function Index() {
      const [images, setImages] = useState<ImageItem[]>([])
      const [loading, setLoading] = useState(true);

      const pathName = usePathname()?.split('/')[2];
      const { textAnimatedStyle, headerAnimatedStyle, scrollHandler, subTextAnimatedStyleAlt } = useAnimatedStyleHook();

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
                  <StickHeroNav
                        no_items={images.length}
                        tabText={pathName.replace('/', '') || 'Home'}
                        style={[styles.header, headerAnimatedStyle]}
                        textStyle={textAnimatedStyle}
                        subTextStyle={subTextAnimatedStyleAlt}
                  />
                  <AnimatedFlatList
                        data={images}
                        renderItem={({ item }) => <ImageCardThumbnail key={item.id} item={item} />}
                        keyExtractor={(item) => item.id as string}
                        numColumns={3}
                        contentContainerStyle={{ paddingTop: HEADER_MAX_HEIGHT + 2, gap: 1 }}
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