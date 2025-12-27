import Cache from '@/lib/cache';
import { AlbumProps, ImageProps } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';
import MaterialRipple from 'react-native-material-ripple';

interface DetailsListItemProps {
      item: AlbumProps
}

const DetailsListItem = ({ item }: DetailsListItemProps) => {
      const router = useRouter();

      const cache = Cache.getInstance();

      return (
            <View className='flex w-full relative h-[70px]'>
                  <MaterialRipple
                        rippleColor='rgba(83, 83, 83, 0.2)'
                        rippleDuration={400}
                        rippleOpacity={60}
                        rippleSequential={false}
                        className='flex flex-1 w-full relative'
                        onPress={() => router.push(`/upload/cloud-album?folder=${item.name}`)}
                        onLongPress={() => console.log("long press")}
                  >
                        <View className='flex flex-row flex-1 items-center justify-start w-full relative px-4 gap-2'>
                              
                              {/* Folder Icon */}
                              <View className='flex h-full flex-col items-center justify-center'>
                                    <View className='flex flex-1 flex-col items-center justify-center px-2'>
                                          <Ionicons name='folder' size={34} color={'#006ee6'} />
                                    </View>
                              </View>
                              {/* Folder Icon */}

                              {/* Folder Details */}
                              <View className='flex flex-1 border-b border-gray-200'>
                                    <View className='flex flex-1 w-full py-5'>
                                          <View className='flex flex-col w-full relative'>
                                                <View>
                                                      <Text>{item?.name}</Text>
                                                </View>
                                                <View className='flex flex-row items-center justify-between w-full'>
                                                      <Text className='text-gray-400 text-sm'>7 Aug 5:27</Text>
                                                      <Text className='text-gray-400 text-sm'>{cache.getData<ImageProps[]>(`cloud-${item.name}`)?.length} Items</Text>
                                                </View>
                                          </View>
                                    </View>
                              </View>
                              {/* Folder Details */}

                        </View>
                  </MaterialRipple>
            </View>
      )
}

export default DetailsListItem

