import { useState, useRef } from 'react';
import { 
  Animated, 
  View, 
  Text, 
  TouchableOpacity,
  Dimensions,
  StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const Gallery = () => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const [activeTab, setActiveTab] = useState('Photos');

  // Header animations
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 180],
    outputRange: [220, 100],
    extrapolate: 'clamp',
  });

  const titleScale = scrollY.interpolate({
    inputRange: [0, 180],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  const titleTranslateY = scrollY.interpolate({
    inputRange: [0, 180],
    outputRange: [0, -20],
    extrapolate: 'clamp',
  });

  const titleOpacity = scrollY.interpolate({
    inputRange: [0, 100, 180],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  const tabOpacity = scrollY.interpolate({
    inputRange: [0, 80, 180],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });

  const tabTranslateY = scrollY.interpolate({
    inputRange: [0, 180],
    outputRange: [20, 0],
    extrapolate: 'clamp',
  });

  const tabs = ['Photos', 'Albums', 'Stories', 'Shared'];

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      
      {/* Sticky Header */}
      <Animated.View 
        style={{ height: headerHeight }}
        className="absolute top-0 left-0 right-0 z-10 bg-white border-b border-gray-200"
      >
        {/* Top Bar with Buttons */}
        <View className="flex-row justify-between items-center pt-12 px-4">
          <TouchableOpacity>
            <Ionicons name="menu" size={24} color="#000" />
          </TouchableOpacity>
          
          <Animated.Text 
            style={{ 
              transform: [
                { scale: titleScale },
                { translateY: titleTranslateY }
              ],
              opacity: titleOpacity 
            }}
            className="text-2xl font-bold text-gray-900 absolute left-0 right-0 text-center"
          >
            Gallery
          </Animated.Text>

          <View className="flex-row space-x-4">
            <TouchableOpacity>
              <Ionicons name="search" size={24} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="ellipsis-vertical" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs that appear when scrolling */}
        <Animated.View 
          style={{ 
            opacity: tabOpacity,
            transform: [{ translateY: tabTranslateY }]
          }}
          className="flex-row justify-around mt-4"
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`py-2 px-4 rounded-full ${
                activeTab === tab ? 'bg-blue-500' : ''
              }`}
            >
              <Text className={`${
                activeTab === tab ? 'text-white' : 'text-gray-600'
              } font-medium`}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
        
      </Animated.View>

      {/* Scroll Content */}
      <Animated.ScrollView
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        contentContainerStyle={{ 
          paddingTop: 220, // Initial header height
          paddingBottom: 20 
        }}
        showsVerticalScrollIndicator={false}
        className="flex-1"
      >
        {/* Grid of images */}
        <View className="flex-row flex-wrap px-1">
          {Array.from({ length: 30 }).map((_, index) => (
            <View 
              key={index} 
              style={{ width: (width - 8) / 3 }}
              className="aspect-square m-1 bg-gray-300 rounded-lg flex items-center justify-center"
            >
              <Text className="text-gray-500 text-xs">Image {index + 1}</Text>
            </View>
          ))}
        </View>
      </Animated.ScrollView>
    </View>
  );
};

export default Gallery;