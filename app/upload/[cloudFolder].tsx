import useAnimatedStyleHook from '@/Backup/hooks/animatedStyle';
import { HEADER_MAX_HEIGHT } from '@/Backup/hooks/image-dimensions';
import CloudImageCardThumbnail from '@/components/CloudImageCardThumbnail';
import ImageViewer from '@/components/imageView';
import StickHeroNav from '@/components/StickHeroNav';
import useSelectionModeBackHandler from '@/hooks/use-selection-backhandler';
import Cache from '@/lib/cache';
import { ImageProps } from '@/types';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<ImageProps | null>);

export default function Index() {
      const [images, setImages] = useState<ImageProps[]>([])
      const [loading, setLoading] = useState(true);
      const [selected, setSelected] = useState<string[]>([]);
      const [selectionMode, setSelectionMode] = useState<boolean>(false);

      const [imageIndex, setImageIndex] = useState<number>(0);
      const [visible, setVisible] = useState<boolean>(false);

      const selectedSet = useMemo(() => new Set(selected), [selected]);
      
      const searchParams = useLocalSearchParams();
      const pathName = searchParams.folder as string;

            // ✅ Create stable extraData object
      const extraData = useMemo(() => ({ 
            selectedSet, 
            selectionMode 
      }), [selectedSet, selectionMode]);

      useSelectionModeBackHandler(selectionMode, setSelectionMode, setSelected);

      const handleOnSelect = useCallback((uri: string) => {
            setSelected((prev) => {
                  const exists = prev.includes(uri);
                  return exists ? prev.filter(item => item !== uri) : [...prev, uri];
            });
      }, []);

      const { textAnimatedStyle, headerAnimatedStyle, scrollHandler, subTextAnimatedStyleAlt } = useAnimatedStyleHook();

      const cache = Cache.getInstance();

      useEffect(() => {
            const fetchImages = async () => {
                  setLoading(true);
                  const imgs = cache.getData<ImageProps[]>(`cloud-${pathName}`);
                  if(imgs) setImages(imgs);
                  setLoading(false);
            }
            fetchImages();
      }, [pathName, cache])

      if (loading) {
            return (
                  <View className="flex-1 items-center justify-center bg-white">
                        <ActivityIndicator size="large" color="#3b82f6" />
                  </View>
            );
      }
      
      return (
            <View className='flex flex-1 h-full w-full relative bg-white'>
                  <ImageViewer images={images} imageIndex={imageIndex} visible={visible} onClose={() => setVisible(!visible)} />
                  <StickHeroNav
                        no_items={images.length}
                        tabText={pathName.replace('/', '') || 'Home'}
                        style={[styles.header, headerAnimatedStyle]}
                        textStyle={textAnimatedStyle}
                        subTextStyle={subTextAnimatedStyleAlt}
                  />
                  <AnimatedFlatList
                        data={images}
                        renderItem={({ item, index }) => (
                              <CloudImageCardThumbnail
                                    item={item ?? {} as ImageProps}
                                    onPress={() => {
                                          setImageIndex(index)
                                          setVisible(true);
                                    }}
                                    onSelect={handleOnSelect}
                                    selectedSet={selectedSet}
                                    selectionMode={selectionMode}
                                    setSelectionMode={setSelectionMode}
                              />
                        )}
                        // renderItem={renderItem}
                        keyExtractor={(item, index) => item?.cloud_id ?? index.toString()}
                        numColumns={3}
                        contentContainerStyle={{ paddingTop: HEADER_MAX_HEIGHT + 2, gap: 1 }}
                        columnWrapperStyle={{ gap: 1 }}
                        extraData={extraData}
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