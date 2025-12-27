import React from 'react'
import { Platform, View } from 'react-native'
import Animated from 'react-native-reanimated'
import AndroidActionNav from './ActionNav.android'
import { Ionicons } from '@expo/vector-icons'
import UploadNav from './UploadNav'

interface StickHeroNavProps {
      isPath?: boolean,
      selectionMode?: boolean,
      style?: any,
      textStyle?: any,
      no_items?: number,
      subTextStyle?: any,
      tabText?: string | undefined,
      uploadPress?: () => void,
      sharePress?: () => void,
      addPress?: () => void,
      setSelectionMode?: (mode: boolean) => void
}

const StickHeroNav = ({isPath, tabText, no_items, style, textStyle, selectionMode, subTextStyle, setSelectionMode, sharePress, addPress}: StickHeroNavProps) => {
      return (
            <Animated.View style={style} className={`w-full ${Platform.OS === 'ios' ? 'bg-[transparent]' : 'bg-black'}`}>
                  <View className='flex-1 flex-col w-full h-full relative'>
                        <View className='flex flex-1 w-full h-full items-center justify-center relative'>
                              <Animated.Text style={textStyle} className='text-4xl text-white'>{tabText}</Animated.Text>
                              <Animated.Text style={textStyle} className='text-sm text-white'>{no_items} {isPath ? 'images' : 'albums'}</Animated.Text>
                        </View>
                        <AndroidActionNav sharePress={sharePress} selectionMode={selectionMode} setSelectionMode={setSelectionMode} no_items={no_items} isPath={isPath} tabText={tabText} textStyle={subTextStyle} addPress={addPress} />
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