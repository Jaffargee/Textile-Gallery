import React from 'react'
import { Platform, View } from 'react-native'
import NavButton from './NavButton'
import Animated from 'react-native-reanimated'
import { AnimatedMaterialRipple } from './animated-components'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur';

interface ActionNavProps {
      no_items?: number,
      isPath?: boolean,
      tabText?: string,
      textStyle?: any,
      addPress?: () => void,
      searchPress?: () => void,
      menuPress?: () => void,
}

const IOSActionNav = ({isPath = true, tabText, no_items, textStyle, addPress}: ActionNavProps) => {
      const router = useRouter();
      return (
            <BlurView intensity={70} tint='light' className='h-[100px] overflow-visible absolute bottom-0 w-full z-[100]'>
                  <View className='flex flex-row items-end w-full h-full relative bg-[#ffffff80]'>
                        <View style={{ paddingHorizontal: isPath ? 8 : 24 }} className='flex-row items-center justify-start gap-2 py-2'>
                              {
                                    isPath && (
                                          <AnimatedMaterialRipple
                                                onPress={() => router.back()}
                                                rippleCentered
                                                rippleDuration={100}
                                                className={'flex flex-col rounded-full overflow-hidden relative z-[100] h-[42px] w-[42px]'}
                                          >
                                                <View className='flex flex-1 flex-col items-center justify-center relative h-full w-full pr-1'>
                                                      <Ionicons name={Platform.OS === 'ios' ? 'chevron-back-outline' : 'arrow-back-outline'} size={30} />
                                                </View>
                                          </AnimatedMaterialRipple>
                                    )
                              }
                              <View className='flex flex-col items-start justify-start'>
                                    <Animated.Text style={[textStyle]} className='text-2xl'>{tabText}</Animated.Text>
                                    <Animated.Text style={textStyle} className='text-sm text-gray-400'>{no_items} images</Animated.Text>
                              </View>
                        </View>
                        <View className='flex-1 flex-row items-end justify-end w-full relative px-4 py-2 gap-2'>
                              <NavButton icon={'add'} onPress={addPress} />
                              <NavButton icon={'search-outline'} icon_size={24} />
                              <NavButton icon={'ellipsis-vertical'} icon_size={24} />
                        </View>
                  </View>
            </BlurView>
      )
}

export default IOSActionNav

// color={'#007AFF'}