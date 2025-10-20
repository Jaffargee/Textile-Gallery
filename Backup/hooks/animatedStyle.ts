import { Platform } from 'react-native';
import { useAnimatedStyle, useSharedValue, interpolate, Extrapolation, useAnimatedScrollHandler } from 'react-native-reanimated';

const HEADER_MAX_HEIGHT = 300;
const HEADER_MIN_HEIGHT = Platform.OS === "ios" ? 100 : 60;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

export default function useAnimatedStyleHook() {
      const scrollY = useSharedValue(0);

      const scrollHandler = useAnimatedScrollHandler({
            onScroll: (event) => {
                  scrollY.value = event.contentOffset.y;
            },
      });

      const headerAnimatedStyle = useAnimatedStyle(() => {
            const height = interpolate(
                  scrollY.value,
                  [0, 100],
                  [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
                  Extrapolation.CLAMP
            );

            return { height };
      });

      // Main title - fully hidden at 80px
      const textAnimatedStyle = useAnimatedStyle(() => {
            const opacity = interpolate(
                  scrollY.value,
                  [0, 100], // Disappears quickly
                  [1, 0],
                  Extrapolation.CLAMP
            );

            const scale = interpolate(
                  scrollY.value,
                  [0, 100],
                  [1, 0.6],
                  Extrapolation.CLAMP
            );

            return {
                  opacity,
                  transform: [{ scale }],
            };
      });

      // Subtitle - starts appearing at 100px (after main title is gone)
      const subTextAnimatedStyleAlt = useAnimatedStyle(() => {
            const opacity = interpolate(
                  scrollY.value,
                  [100, HEADER_SCROLL_DISTANCE], // Starts after main title is hidden
                  [0, 1],
                  Extrapolation.CLAMP
            );

            return { opacity };
      });

      const paddingAnimationStyle = useAnimatedStyle(() => {
            const paddingTop = interpolate(
                  scrollY.value,
                  [0, HEADER_SCROLL_DISTANCE],
                  [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
                  Extrapolation.CLAMP
            );
            
            return { paddingTop };
      });

      return { scrollY, scrollHandler, headerAnimatedStyle, textAnimatedStyle, subTextAnimatedStyleAlt, paddingAnimationStyle };
}
