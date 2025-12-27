import React from 'react'
import { Platform, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter, usePathname } from 'expo-router'
import { BlurView } from 'expo-blur'
import { AnimatedMaterialRipple } from './animated-components'
import Animated from 'react-native-reanimated'
import NavButton from './NavButton'
import MaterialRipple from 'react-native-material-ripple';

interface UploadNavProps {
      textStyle?: any,
      addPress?: () => void,
      uploadPress?: (target: boolean) => void
}

const UploadNav = ({ textStyle, addPress, uploadPress }: UploadNavProps) => {
      return Platform.OS === "ios" ? (
            <BlurView intensity={70} tint='light' className={`w-full h-[100px] ${Platform.OS === "ios" ? 'absolute bottom-0 left-0 right-0' : 'relative' }`}>
                  <UploadNavContent textStyle={textStyle} addPress={addPress} />
            </BlurView>
      ) : (
            <View className='w-full min-h-[70px] bg-white'>
                  <UploadNavContent textStyle={textStyle} addPress={addPress} uploadPress={uploadPress} />
            </View>
      )
}

const UploadNavContent = ({ textStyle, addPress, uploadPress }: UploadNavProps) => {
      const router = useRouter();
      const pathName = usePathname();
      return (
            <View className={'flex flex-row items-end justify-start w-full flex-1 bg-[#ffffff80] relative'}>
                  <View className='flex flex-row items-center justify-start relative px-4 py-4 w-full'>
                        <AnimatedMaterialRipple
                              onPress={() => router.back()}
                              rippleCentered
                              rippleDuration={100}
                              className={'flex flex-col rounded-full overflow-hidden z-[100] h-[42px] w-[42px]'}
                        >
                              <View className='flex flex-1 flex-col items-center justify-center relative h-full w-full pr-1'>
                                    <Ionicons name={'chevron-back-outline'} size={30} />
                              </View>
                        </AnimatedMaterialRipple>
                        <Animated.View 
                              style={textStyle} 
                              className='flex flex-row items-center justify-start flex-1'
                              pointerEvents="none" // Add this to prevent blocking touches
                        >
                              <Animated.Text className='text-2xl'>Cloud Upload</Animated.Text>
                        </Animated.View>
                        <View className='flex flex-row items-center justify-end gap-1'>
                              <NavButton onPress={addPress} icon={'add'} />
                              <MaterialRipple
                                    rippleColor='rgba(255, 255, 255, 0.41)'
                                    rippleDuration={400}
                                    rippleOpacity={60}
                                    onPress={() => router.navigate('/cloud-directory')}
                                    className='bg-primary h-[42px] rounded-full px-6'
                              >
                                    <View className='flex h-full w-full relative items-center justify-center'>
                                          <Text className='text-white' style={{fontSize: Platform.OS === "ios" ? 20 : 20, lineHeight: 24}}>{pathName === "/upload" ? 'Continue' : 'Upload'}</Text>
                                    </View>
                              </MaterialRipple>
                        </View>
                  </View>
            </View>
      )
}

export default UploadNav