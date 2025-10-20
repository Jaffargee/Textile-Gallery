import { ImageItem } from '@/Backup/hooks/image-service';
import { FlatList } from 'react-native';
import MaterialRipple from 'react-native-material-ripple';
import Animated from 'react-native-reanimated';

export const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<ImageItem>);
export const AnimatedFlatList2 = Animated.createAnimatedComponent(FlatList<any>);
export const AnimatedMaterialRipple = Animated.createAnimatedComponent(MaterialRipple);
