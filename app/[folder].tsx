// app/[folder].tsx
import { AnimatedFlatList } from '@/Backup/components/animated-components';
import ImageCardThumbnail from '@/components/ImageCardThumbnail';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { ImageProps, SharingProgressProps} from '@/types';
import StickHeroNav from '@/components/StickHeroNav';
import useAnimatedStyleHook from '@/hooks/useAnimatedStyles';
import { useImageSync } from '@/hooks/image-sync-context';
import Helpers from '@/utils/helpers';
import useSelectionModeBackHandler from '@/hooks/use-selection-backhandler';
import useSharing from '@/hooks/useSharing';
import { TGMediaRepository } from '@/lib/file-manager';
import PrepareSharing from '@/components/PrepareSharing';
import { HEADER_MAX_HEIGHT } from '@/utils/image-dimensions';
import { Galeria } from '@nandorojo/galeria';



export default function Index() {
      const [images, setImages] = useState<ImageProps[]>([]);
      const [loading, setLoading] = useState<boolean>(false);
      const [selected, setSelected] = useState<string[]>([]);
      const [selectionMode, setSelectionMode] = useState<boolean>(false);

      const [progress, setProgress] = useState<SharingProgressProps>({ progress: 0, current: 0, total: 0 });

      const { shareImages } = useSharing();
      
      const imageSyncRef = useImageSync();
      useSelectionModeBackHandler(selectionMode, setSelectionMode, setSelected);

      const searchParams = useLocalSearchParams();
      const pathName = searchParams.folder as string;
      const album_id = Number(searchParams.album_id);

      const { headerAnimatedStyle, textAnimatedStyle, subTextAnimatedStyleAlt, scrollHandler } = useAnimatedStyleHook();

      // ✅ Convert selected array to Set for O(1) lookup
      const selectedSet = useMemo(() => new Set(selected), [selected]);

      // ✅ Create stable extraData object
      const extraData = useMemo(() => ({ 
            selectedSet, 
            selectionMode 
      }), [selectedSet, selectionMode]);

      // ✅ renderItem doesn't depend on selected anymore
      const renderItem = useCallback(({ item, index }: { item: ImageProps, index: number }) => (
            <ImageCardThumbnail
                  index={index}
                  item={item}
                  selectedSet={selectedSet}
                  selectionMode={selectionMode}
            />
      ), [selectedSet, selectionMode]);

      const keyExtractor = useCallback((item: ImageProps) => item.id?.toString() || '', []);

      const contentContainerStyle = useMemo(() => ({ gap: 1 }), []);
      const columnWrapperStyle = useMemo(() => ({ gap: 1 }), []);
                              
      useEffect(() => {
            let isMounted = true;

            async function fetchImages() {
                  if (!imageSyncRef.current) {
                        console.log('⚠️ ImageSync not ready yet');
                        return;
                  }

                  try {
                        setLoading(true);
                        
                        const imgs = Helpers.constructImagesArray(
                              await imageSyncRef.current.getDbWithCache().getImages(album_id)
                        );
                        
                        if (isMounted) {
                              setImages(imgs);
                        }
                        
                  } catch (error) {
                        console.error('Error fetching images:', error);
                  } finally {
                        if (isMounted) {
                              setLoading(false);
                        }
                  }
            }

            fetchImages();

            return () => {
                  isMounted = false;
            };

      }, [album_id, imageSyncRef]);

      if (loading) {
            return (
                  <View className='flex flex-1 h-full w-full relative bg-black'>
                        <View className="flex-1 items-center justify-center">
                              <ActivityIndicator size="large" color="#3b82f6" />
                        </View>
                  </View>
            );
      }

      return (
            <View className='flex flex-1 h-full w-full relative bg-black'>
                  {
                        progress.progress > 0 &&
                        <PrepareSharing progress={progress} onCancel={() => setProgress({progress: 0, current: 0, total: 0})} />
                  }

                  <StickHeroNav
                        tabText={pathName}
                        selectionMode={selectionMode}
                        no_items={images.length}
                        style={[headerAnimatedStyle, styles.header]}
                        textStyle={textAnimatedStyle}
                        subTextStyle={subTextAnimatedStyleAlt}
                        setSelectionMode={setSelectionMode}
                        sharePress={async () => {
                              try {                                    
                                    await TGMediaRepository.prepareSharing(
                                          [...selectedSet],
                                          setProgress,
                                          setSelected,
                                          setSelectionMode,
                                          shareImages
                                    );
                              } catch (error) {
                                    console.log(error);
                              }
                        }}
                  />
                  <Galeria urls={images} theme='dark'>
                        <AnimatedFlatList
                              data={images}
                              renderItem={renderItem}
                              keyExtractor={keyExtractor}
                              numColumns={3}
                              contentContainerStyle={contentContainerStyle}
                              columnWrapperStyle={columnWrapperStyle}
                              // ✅ CRITICAL: Tell FlatList when to re-render
                              extraData={extraData}
                              removeClippedSubviews={true}
                              showsVerticalScrollIndicator={false}
                              maxToRenderPerBatch={15}
                              updateCellsBatchingPeriod={30}
                              initialNumToRender={21}
                              windowSize={5}
                              onScroll={scrollHandler}
                              scrollEventThrottle={16}
                              getItemLayout={(data, index) => {
                                    const ITEM_HEIGHT = 130;
                                    const GAP = 1;
                                    const rowIndex = Math.floor(index / 3);
                                    return {
                                          length: ITEM_HEIGHT,
                                          offset: (ITEM_HEIGHT + GAP) * rowIndex,
                                          index,
                                    };
                              }}
                              ListHeaderComponent={<View style={{paddingTop: HEADER_MAX_HEIGHT}} />}
                        />
                  </Galeria>
            </View>
      );
}


const styles = StyleSheet.create({
      header: {
            width: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
      }
});