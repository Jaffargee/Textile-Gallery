import React from 'react'
import { Platform, View } from 'react-native'
import Animated from 'react-native-reanimated'
import PlatformRender from './PlatformRender'
import AndroidActionNav from './ActionNav.android'
import IOSActionNav from './ActionNav.ios'

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
      return (
            <Animated.View style={style} className={`w-full ${Platform.OS === 'ios' ? 'bg-[transparent]' : 'bg-white'}`}>
                  <View className='flex-1 flex-col w-full h-full relative'>
                        <View className='flex flex-1 w-full h-full items-center justify-center relative'>
                              <Animated.Text style={textStyle} className='text-4xl'>{tabText}</Animated.Text>
                              <Animated.Text style={textStyle} className='text-sm text-gray-400'>{no_items} images</Animated.Text>
                        </View>
                        <PlatformRender platforms={{
                              ios: <IOSActionNav no_items={no_items} isPath={isPath} tabText={tabText} textStyle={subTextStyle} />,
                              android: <AndroidActionNav no_items={no_items} isPath={isPath} tabText={tabText} textStyle={subTextStyle} />
                        }}/>
                  </View> 
            </Animated.View>
      )
}

export default StickHeroNav