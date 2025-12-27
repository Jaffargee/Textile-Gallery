import { useEffect } from "react";
import { View } from "react-native";
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";


export default function ProgressBar({ progress } : { progress: number }) {
      const progressValue = useSharedValue(0);

      useEffect(() => {
            progressValue.value = withTiming(progress / 100, { duration: 1000 });
      }, [progress, progressValue]);

      const animatedStyle = useAnimatedStyle(() => {
            const width = interpolate(progressValue.value, [0, 1], [0, 100]);
            return { width: `${width}%` };
      });

      return (
            <View style={{ width: "100%", height: 4, backgroundColor: "#ddd", borderRadius: 20 }}>
                  <Animated.View
                        style={[{
                              height: "100%",
                              backgroundColor: "#0071dbff",
                              borderRadius: 20,
                        }, animatedStyle]}
                  />
            </View>
      );
}
