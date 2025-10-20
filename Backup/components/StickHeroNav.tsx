import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React from 'react'
import { Platform, View } from 'react-native'
import Animated from 'react-native-reanimated'
import AndroidActionNav from './ActionNav.android'
import PlatformRender from './PlatformRender'
import IOSActionNav from './ActionNav.ios'
import UploadNav from './UploadNav'

interface StickHeroNavProps {
      isPath?: boolean,
      style?: any,
      textStyle?: any,
      no_items?: number,
      subTextStyle?: any,
      tabText?: string | undefined,
      addPress?: any,
      uploadPress?: () => void
}

const StickHeroNav = ({isPath, tabText, no_items, style, textStyle, subTextStyle}: StickHeroNavProps) => {
      const router = useRouter();
      return (
            <Animated.View style={style} className={`h-[300px] w-full flex absolute top-0 left-0 bottom-0 right-0 z-[100] ${Platform.OS === 'ios' ? 'bg-[transparent]' : 'bg-white'}`}>
                  <View className='flex-1 flex-col w-full h-full relative'>
                        <View className='flex flex-1 w-full h-full items-center justify-center relative'>
                              <Animated.Text style={textStyle} className='text-4xl'>{tabText}</Animated.Text>
                              <Animated.Text style={textStyle} className='text-sm text-gray-400'>{no_items} images</Animated.Text>
                        </View>
                        <PlatformRender platforms={{
                              ios: <IOSActionNav no_items={no_items} isPath={isPath} addPress={() => router.navigate('/upload/')} tabText={tabText} textStyle={subTextStyle} />,
                              android: <AndroidActionNav no_items={no_items} isPath={isPath} addPress={() => router.navigate('/upload')} tabText={tabText} textStyle={subTextStyle} />
                        }}/>
                  </View> 
            </Animated.View>
      )
}

export const StickUploadHeroNav = ({tabText, style, textStyle, subTextStyle, addPress, uploadPress}: StickHeroNavProps) => {
      return (
            <Animated.View style={style} className='h-[300px] w-full flex absolute top-0 left-0 bottom-0 right-0 z-[100]'>
                  <View className='flex-1 flex-col w-full h-full relative'>
                        <Animated.View className='flex flex-1 w-full h-full items-center justify-center relative gap-2' style={textStyle}>
                              <Ionicons name='cloud-upload-outline' size={50} />
                              <Animated.Text className='text-4xl'>{tabText}</Animated.Text>
                        </Animated.View>
                        <UploadNav textStyle={subTextStyle} addPress={addPress} uploadPress={uploadPress} />
                  </View>
            </Animated.View>
      )
}

export default StickHeroNav