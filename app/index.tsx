import { StyleSheet, View, ActivityIndicator, FlatList } from 'react-native'
import { useCallback } from 'react';
import { ImageDirProps } from '@/types';
import Animated from 'react-native-reanimated';
import Album from '@/components/Album';
import useBackgroundSync from '@/hooks/useBackgroundSync';
import StickHeroNav from '@/components/StickHeroNav';
import useAnimatedStyleHook from '@/hooks/useAnimatedStyles';
import { HEADER_MAX_HEIGHT } from '@/utils/image-dimensions';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<ImageDirProps | null>);

export default function Index() {

      const keyExtractor = useCallback((item: ImageDirProps | null, index: number) => index.toString(), []);

      const { headerAnimatedStyle, textAnimatedStyle, subTextAnimatedStyleAlt, scrollHandler } = useAnimatedStyleHook()
      
      const renderItem = useCallback(({ item }: { item: ImageDirProps | null }) => (
            item &&
            <Album item={item} />
      ), []);

      const { loading, localAlbumImages } = useBackgroundSync();
      
      return (
            <View className='flex flex-1 h-full w-full relative bg-white'>
                  <StickHeroNav
                        tabText='Album'
                        no_items={localAlbumImages.length}
                        style={[headerAnimatedStyle, styles.header]}
                        textStyle={textAnimatedStyle}
                        subTextStyle={subTextAnimatedStyleAlt}
                  />
                  {
                        loading ? (
                              <View className="flex-1 items-center justify-center bg-white">
                                    <ActivityIndicator size="large" color="#3b82f6" />
                              </View>
                        ): <AnimatedFlatList
                              data={localAlbumImages}
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