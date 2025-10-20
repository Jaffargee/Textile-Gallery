import { Stack } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import '../global.css';
import { Platform, StatusBar } from "react-native";
import { useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as Font from 'expo-font';
import * as NavigationBar from "expo-navigation-bar";

export default function RootLayout() {
      useEffect(() => {
            Font.loadAsync(Ionicons.font);
            // Set background color
            NavigationBar.setBackgroundColorAsync("blue"); // or any color, even "transparent"
        
            // Optional: control button style
            NavigationBar.setButtonStyleAsync("dark"); // or "light" for white buttons on dark bg
      }, []);
      return (
            Platform.OS === "android" ? (
                  <SafeAreaProvider>
                        <SafeAreaView className="flex flex-1 h-full w-full bg-white">
                              <StatusBar barStyle={'dark-content'} backgroundColor={'white'} />
                              <Stack screenOptions={{headerShown: false}} />
                        </SafeAreaView>
                  </SafeAreaProvider>
            ) : 
            <>
                  <StatusBar barStyle={'dark-content'} backgroundColor={'white'} />
                  <Stack screenOptions={{headerShown: false}} />
            </>
      )
}
