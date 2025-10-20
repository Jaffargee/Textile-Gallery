import { AnimatedFlatList } from '@/Backup/components/animated-components';
import ImageCardThumbnail from '@/components/ImageCardThumbnail';
import { HEADER_MAX_HEIGHT } from '@/Backup/hooks/image-dimensions';
import { usePathname } from 'expo-router';
import { ActivityIndicator, View, StyleSheet, Button } from 'react-native';
import useBackgroundSync from '@/hooks/useBackgroundSync';
import { useEffect, useState } from 'react';
import { ImageItem } from '@/types';
import StickHeroNav from '@/components/StickHeroNav';
import useAnimatedStyleHook from '@/hooks/useAnimatedStyles';
import { shareMultipleImages } from '@/Backup/hooks/useSharing';

export default function Index() {

      const [images, setImages] = useState<(ImageItem | null)[]>([])
      const pathName = usePathname()?.split('/')[1];

      const { loading, backgroundFileSync } = useBackgroundSync();
      const { headerAnimatedStyle, textAnimatedStyle, subTextAnimatedStyleAlt, scrollHandler } = useAnimatedStyleHook()
      
      const [selected, setSelected] = useState<string[]>([])

      useEffect(() => {
            async function loadImages() {
                  const images = await backgroundFileSync(pathName);
                  const imgs = images?.filter(i => i !== null);
                  if(imgs) setImages(imgs);
            }

            loadImages()
      }, [pathName, backgroundFileSync])

      const handleOnSelect = (uri: string) => {
            const exists = selected.filter(item => item === uri);
            if(!(exists.length > 0)){
                  setSelected((prev) => [...prev, uri])
            } else {
                  setSelected((prev) => [...selected.filter(item => item !== uri)])
            }
      }

      const shareTo = () => {
            shareMultipleImages(selected);
      }

      return (
            <View className='flex flex-1 h-full w-full relative bg-white'>
                  <StickHeroNav
                        tabText={pathName}
                        no_items={images.length}
                        style={[headerAnimatedStyle, styles.header]}
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
                              renderItem={({ item }) => <ImageCardThumbnail selected={selected} key={item.id} item={item} onSelect={handleOnSelect} />}
                              keyExtractor={(item) => item.id as string}
                              numColumns={3}
                              contentContainerStyle={{ paddingTop: HEADER_MAX_HEIGHT, gap: 1 }}
                              columnWrapperStyle={{ gap: 1 }}
                              removeClippedSubviews={true}
                              showsVerticalScrollIndicator={false}
                              maxToRenderPerBatch={10}
                              updateCellsBatchingPeriod={50}
                              initialNumToRender={15}
                              windowSize={10}
                              onScroll={scrollHandler}
                              scrollEventThrottle={16}
                        />
                  }
                  <Button title='Share' onPress={shareTo} />
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