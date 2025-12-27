import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { AlbumProps, SharingProgressProps } from '@/types';
import Animated from 'react-native-reanimated';
import useSyncing from '@/hooks/sync'
import Album from '@/components/Album';
import StickHeroNav from '@/components/StickHeroNav';
import useAnimatedStyleHook from '@/hooks/useAnimatedStyles';
import useSelectionModeBackHandler from '@/hooks/use-selection-backhandler';
import PrepareSharing from '@/components/PrepareSharing';
import { TGMediaRepository } from '@/lib/file-manager';
import { HEADER_MAX_HEIGHT } from '@/utils/image-dimensions';
import useSharing from '@/hooks/useSharing';
import ProgressContainer from '@/components/ProgressContainer';
import AlbumModal from '@/components/AlbumModal';


const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<AlbumProps | null>);
       
export default function Index() {
      
      const { loading, albums } = useSyncing();
      const [selected, setSelected] = useState<string[]>([])
      const [selectionMode, setSelectionMode] = useState<boolean>(false);
      
      const [progress, setProgress] = useState<SharingProgressProps>({ progress: 0, current: 0, total: 0 });

      const { shareImages } = useSharing();
      
      const keyExtractor = useCallback((item: AlbumProps | null, index: number) => item?.id?.toString() || index.toString(), []);
      const renderItem = useCallback(({ item }: { item: AlbumProps | null }) => {
            const handleOnSelect = (uri: string) => {
                  const exists = selected.filter(item => item === uri);
                  if(!(exists.length > 0)){
                        setSelected((prev) => [...prev, uri])
                  } else {
                        setSelected((prev) => [...selected.filter(item => item !== uri)])
                  }
            }
            return ( item && <Album item={item} selected={selected} selectionMode={selectionMode} onSelect={handleOnSelect} setSelectionMode={setSelectionMode} /> );
      }, [selected, selectionMode]);
      
      const { headerAnimatedStyle, textAnimatedStyle, subTextAnimatedStyleAlt, scrollHandler } = useAnimatedStyleHook();

      useSelectionModeBackHandler(selectionMode, setSelectionMode, setSelected);

      const [isAlbumModalOpen, setIsAlbumModalOpen] = useState<boolean>(false);

      return (
            <View className='flex flex-1 h-full w-full items-center justify-center relative'>
                  {
                        progress.progress > 0 &&
                        <PrepareSharing progress={progress} onCancel={() => setProgress({progress: 0, current: 0, total: 0})} />
                  }
                  {
                        isAlbumModalOpen && <AlbumModal setOpen={setIsAlbumModalOpen} />
                  }
                  <ProgressContainer />
                  <View className='flex flex-1 h-full w-full items-center justify-center relative bg-black'>
                              <StickHeroNav
                                    tabText={'Albums'}
                                    isPath={false}
                                    selectionMode={selectionMode}
                                    no_items={albums.length}
                                    style={[headerAnimatedStyle, styles.header]}
                                    textStyle={textAnimatedStyle}
                                    subTextStyle={subTextAnimatedStyleAlt}
                                    addPress={() => setIsAlbumModalOpen(!isAlbumModalOpen)}
                                    sharePress={async () => {
                                          try {
                                                const albumsImagesArray = Promise.all(selected.map(async (album) => {
                                                      const ls = await TGMediaRepository.listDir(album);
                                                      return ls ? ls.map(image => image.path) : []
                                                }))

                                                const flatArray = (await albumsImagesArray).flat();

                                                await TGMediaRepository.prepareSharing(
                                                      flatArray,
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
                              {
                                    loading ? 
                                          <View className="flex-1 items-center justify-center bg-black">
                                                <ActivityIndicator size="large" color="#3b82f6" />
                                          </View>
                                    :
                                          <AnimatedFlatList
                                                data={albums}
                                                renderItem={renderItem}
                                                keyExtractor={keyExtractor}
                                                numColumns={3}
                                                contentContainerClassName={'px-2'}
                                                contentContainerStyle={{ paddingTop: HEADER_MAX_HEIGHT, gap: 8 }}
                                                columnWrapperStyle={{ gap: 4 }}
                                                removeClippedSubviews={true}
                                                showsVerticalScrollIndicator={false}
                                                maxToRenderPerBatch={10}
                                                updateCellsBatchingPeriod={50}
                                                initialNumToRender={15}
                                                windowSize={10}
                                                scrollEventThrottle={16}
                                                onScroll={scrollHandler}
                                          />
                              }
                  </View>
            </View>
      )
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
