import { Stack } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import '../global.css';
import { Platform, StatusBar, View } from "react-native";
import { ImageSyncProvider } from "@/hooks/image-sync-context";
import ProgressProvider from "@/hooks/progress-context";
import { useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as Font from 'expo-font';
import * as NavigationBar from "expo-navigation-bar";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DBContextProvider from "@/contexts/dbcontext";

export default function RootLayout() {

      useEffect(() => {
            Font.loadAsync(Ionicons.font);
            // Set background color
            NavigationBar.setBackgroundColorAsync("#000"); // or any color, even "transparent"
            // Optional: control button style
            NavigationBar.setButtonStyleAsync("light"); // or "light" for white buttons on dark bg
      }, []);

      return (
            Platform.OS === "android" ? (
                  <GestureHandlerRootView>
                        <DBContextProvider>
                              <ImageSyncProvider>
                                    <ProgressProvider>
                                          <SafeAreaProvider>
                                                <SafeAreaView className="flex flex-1 h-full w-full bg-black">
                                                <View className="flex flex-1">
                                                      <StatusBar barStyle={'light-content'} backgroundColor={'#000'} />
                                                      <Stack screenOptions={{
                                                            headerShown: false, 
                                                            freezeOnBlur: true,
                                                            animation: 'slide_from_right',
                                                            statusBarStyle: 'light',
                                                            statusBarAnimation: 'fade',
                                                            contentStyle: { backgroundColor: 'black' }
                                                      }}  />
                                                </View>
                                                </SafeAreaView>
                                          </SafeAreaProvider>
                                    </ProgressProvider>
                              </ImageSyncProvider>
                        </DBContextProvider>
                  </GestureHandlerRootView>
            ) : 
            <>
                  <StatusBar barStyle={'dark-content'} backgroundColor={'white'} />
                  <Stack screenOptions={{headerShown: false}} />
            </>
      )
}
