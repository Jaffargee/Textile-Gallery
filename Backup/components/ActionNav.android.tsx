import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React from 'react'
import { View } from 'react-native'
import Animated from 'react-native-reanimated'
import { AnimatedMaterialRipple } from './animated-components'
import NavButton from './NavButton'

interface ActionNavProps {
      isPath?: boolean,
      no_items?: number,
      tabText?: string,
      textStyle?: any,
      addPress?: () => void,
      searchPress?: () => void,
      menuPress?: () => void,
}

const AndroidActionNav = ({isPath = true, tabText, no_items, textStyle, addPress}: ActionNavProps) => {
      const router = useRouter();
      return (
            <View className='h-[60px] overflow-visible relative bg-white z-[100]'>
                  <View className='flex flex-row items-center w-full h-full relative'>
                        <View style={{ paddingHorizontal: isPath ? 8 : 24 }} className='flex-row items-center justify-start gap-2'>
                              {
                                    isPath && (
                                          <AnimatedMaterialRipple
                                                onPress={() => router.back()}
                                                rippleCentered
                                                rippleDuration={100}
                                                className={'flex flex-col rounded-full bg-white px-2 py-2 overflow-hidden relative shadow-m z-[100]'}
                                          >
                                                <View className='flex flex-col items-center justify-center relative'>
                                                      <Ionicons name='chevron-back-outline' size={25} />
                                                </View>
                                          </AnimatedMaterialRipple>
                                    )
                              }
                              <View className='flex flex-col items-start justify-start leading-2'>
                                    <Animated.Text style={textStyle} className='text-2xl'>{tabText}</Animated.Text>
                                    <Animated.Text style={textStyle} className='text-sm text-gray-400'>{no_items} images</Animated.Text>
                              </View>
                        </View>
                        <View className='flex-1 flex-row items-center justify-end w-full h-full relative px-4 gap-1'>
                              <NavButton icon={'add'} onPress={addPress} />
                              <NavButton icon={'search-outline'} icon_size={24} />
                              <NavButton icon={'ellipsis-vertical'} icon_size={24} />
                        </View>
                  </View>
            </View>
      )
}

export default AndroidActionNav