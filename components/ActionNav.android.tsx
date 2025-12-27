import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React from 'react'
import { Text, View } from 'react-native'
import Animated from 'react-native-reanimated'
import { AnimatedMaterialRipple } from './animated-components'
import NavButton from './NavButton'

interface ActionNavProps {
      isPath?: boolean,
      selectionMode?: boolean,
      no_items?: number,
      tabText?: string,
      textStyle?: any,
      setSelectionMode?: (mode: boolean) => void,
      sharePress?: () => void,
      addPress?: () => void,
      searchPress?: () => void,
      menuPress?: () => void,
}

const AndroidActionNav = ({isPath = true, tabText, no_items, textStyle, selectionMode, setSelectionMode, addPress, sharePress}: ActionNavProps) => {
      const router = useRouter();
      return (
            <View className='h-[60px] overflow-visible relative z-[100]'>
                  <View className='flex flex-row items-center w-full h-full relative'>
                        <View style={{ paddingHorizontal: isPath ? 8 : 24 }} className='flex-row items-center justify-start gap-2'>
                              {
                                    isPath && (
                                          <AnimatedMaterialRipple
                                                onPress={() => router.back()}
                                                rippleCentered
                                                rippleDuration={100}
                                                className={'flex flex-col rounded-full px-2 py-2 overflow-hidden relative shadow-m z-[100]'}
                                          >
                                                <View className='flex flex-col items-center justify-center relative'>
                                                      <Ionicons name='chevron-back-outline' size={25} color={'white'} />
                                                </View>
                                          </AnimatedMaterialRipple>
                                    )
                              }
                              <View className='flex flex-col items-start justify-start leading-2'>
                                    <Animated.Text style={[textStyle]} className='text-2xl text-white'>{tabText}</Animated.Text>
                                    <Animated.Text style={[textStyle]} className='text-sm text-gray-400 text-white'>{no_items} {isPath ? 'images' : 'albums'}</Animated.Text>
                              </View>
                        </View>
                        <View className='flex-1 flex-row items-center justify-end w-full h-full relative px-4 gap-1'>
                              {
                                    selectionMode ? <NavButton icon={'share-social-outline'} onPress={sharePress} />
                                    :
                                    <>
                                          <NavButton icon={'add'} onPress={addPress} />
                                          {/* <NavButton icon={'search-outline'} icon_size={24} />
                                          <NavButton icon={'ellipsis-vertical'} icon_size={24} /> */}
                                          {
                                                isPath &&
                                                <AnimatedMaterialRipple onPress={() => setSelectionMode?.(!selectionMode)} className='bg-blue-600 flex flex-col items-center justify-center px-6 overflow-hidden rounded-full h-[34px]'>
                                                      <View className='flex flex-1 w-full relative items-center justify-center'>
                                                            <Text className='text-white text-lg'>{selectionMode ? 'Cancel' : 'Select'}</Text>
                                                      </View>
                                                </AnimatedMaterialRipple>
                                          }
                                    </>
                              }
                        </View>
                  </View>
            </View>
      )
}

export default AndroidActionNav