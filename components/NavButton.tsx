import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { View, TouchableWithoutFeedbackProps} from 'react-native'
import MaterialRipple from 'react-native-material-ripple';

interface NavButtonProps {
      title?: string | undefined,
      icon?: any,
      icon_size?: number | undefined,
      className?: string | '' | undefined,
}

const NavButton = ({icon, icon_size = 28, className, ...rest}: NavButtonProps & TouchableWithoutFeedbackProps) => {
      return (
            <MaterialRipple
                  {...rest}
                  rippleColor="rgba(48, 48, 48, 0.18)"
                  rippleDuration={100}
                  rippleOpacity={50}
                  rippleCentered
                  rippleContainerBorderRadius={50}
                  rippleFades
                  rippleSequential
                  removeClippedSubviews
                  className={'rounded-full h-[42px] w-[42px] relative overflow-hidden'}
            >
                  <View className='flex flex-col items-center justify-center h-full w-full relative'>
                        <Ionicons name={icon} size={icon_size} color={'white'} />
                  </View>
            </MaterialRipple>
      )
}

export default NavButton

