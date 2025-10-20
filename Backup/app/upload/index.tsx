import { AnimatedFlatList } from '@/Backup/components/animated-components';
import ImageCardThumbnail from '@/Backup/components/ImageCardThumbnail';
import { StickUploadHeroNav } from '@/Backup/components/StickHeroNav';
import useAnimatedStyleHook from '@/Backup/hooks/animatedStyle';
import { HEADER_MAX_HEIGHT } from '@/Backup/hooks/image-dimensions';
import useImagePicker from '@/Backup/hooks/image-picker';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

const Upload = () => {
      return (
            <View className='flex flex-1 h-full w-full bg-white'>
                 <ThereIsSelection />
            </View>
      )
}

const ThereIsSelection = () => {
      const { textAnimatedStyle, headerAnimatedStyle, scrollHandler, subTextAnimatedStyleAlt } = useAnimatedStyleHook();
      const { images, pickImages, loading } = useImagePicker();
      const selected  = images.length > 0;

      return (
            <View className='flex flex-1 h-full'>
                  <StickUploadHeroNav
                        tabText='Cloud Upload'
                        style={headerAnimatedStyle}
                        textStyle={textAnimatedStyle}
                        subTextStyle={subTextAnimatedStyleAlt}
                        addPress={pickImages}
                  />
                  {
                        !selected && !loading ? <NoSelection pickImages={pickImages} /> :
                        loading ? (
                              <View className="flex-1 items-center justify-center bg-white">
                                    <ActivityIndicator size="large" color="#3b82f6" />
                              </View>
                        ) :
                        <AnimatedFlatList
                              data={images}
                              renderItem={({ item }) => (
                                    <ImageCardThumbnail item={item} key={item.id} />
                              )}
                              keyExtractor={(item) => item.id as string}
                              numColumns={3}
                              contentContainerStyle={{ paddingTop: HEADER_MAX_HEIGHT + 2, gap: 1 }}
                              columnWrapperStyle={{ gap: 1 }}
                              // Performance optimizations
                              removeClippedSubviews={true}
                              showsVerticalScrollIndicator={false}
                              maxToRenderPerBatch={15}
                              updateCellsBatchingPeriod={50}
                              initialNumToRender={25}
                              windowSize={21}
                              onScroll={scrollHandler}
                              scrollEventThrottle={16}
                        />
                  }
            </View>
      )
}

const NoSelection = ({ pickImages }: {pickImages: () => void}) => {
      return (
            <View className='flex h-full flex-1 w-full items-center justify-center' style={{paddingTop: HEADER_MAX_HEIGHT - 60}}>
                  <View className='flex flex-col items-center justify-center w-full py-4'>
                        <Ionicons name='images' size={150} color='#d4d4d4ff' />
                  </View>
                  <View className='w-full relative px-4 items-center justify-center'>
                        <Text className='text-gray-400 text-2xl'>No images selected</Text>
                  </View>
            </View>
      )
}



export default Upload
