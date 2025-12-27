import React from 'react';
import { Pressable, StyleProp, ViewStyle, Vibration } from 'react-native';

type ImagePressableProps = {
      onPress?: () => void,
      onSelect?: (uri: string) => void,
      selectionMode?: boolean,
      setSelectionMode?: (mode: boolean) => void,
      style?: StyleProp<ViewStyle>,
      children: React.ReactNode,
      uri: string,
      route?: string,
      className?: string
}

const ImagePressable = ({ children, style,  uri, className, onPress, onSelect, setSelectionMode }: ImagePressableProps) => {      
      return (
            <Pressable style={style} className={className !== '' ? className : 'flex-1 overflow-hidden'} 
                  onLongPress={() => {
                        Vibration.vibrate(50);
                        setSelectionMode?.(true);
                        onSelect?.(uri);
                  }} 
                  onPress={onPress}
            >
                  {children}
            </Pressable>
      )
}

export default ImagePressable;
