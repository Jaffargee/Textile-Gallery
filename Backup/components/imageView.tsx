import type { ImageItem } from "@/Backup/hooks/types";
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from "expo-blur";
import { Platform, View } from 'react-native';
import ImageView from 'react-native-image-viewing';
import { SafeAreaView } from "react-native-safe-area-context";
import { AnimatedMaterialRipple } from './animated-components';


export interface ImageViewerProps {
      images: ImageItem[],
      imageIndex: number;
      visible: boolean;
      onClose: () => void;
}

const ImageViewer = ({ images, imageIndex, visible, onClose = () => {} }: ImageViewerProps) => {    
    return (
        <ImageView
            keyExtractor={(item, index) => index.toString()}
            images={images}
            imageIndex={imageIndex}
            visible={visible}
            onRequestClose={onClose}
            animationType="slide"
            presentationStyle='fullScreen'
            backgroundColor='white'
            swipeToCloseEnabled={true}
            doubleTapToZoomEnabled={true}
            delayLongPress={800}
            HeaderComponent={HeaderComponent}
            FooterComponent={FooterComponent}
        />
    );
}

const HeaderComponent = ({ imageIndex }: { imageIndex: number }) => {
    return (
        <View className="w-full min-h-[100px] absolute top-0 left-0 flex flex-row items-center justify-center z-50">
            <BlurView tint="light" intensity={70} className='flex flex-1 h-full w-full relative items-center justify-end px-4 py-2'>
                <View className='flex flex-row items-center justify-between'>
                    <AnimatedMaterialRipple
                        rippleCentered
                        rippleDuration={100}
                        className={'flex flex-col rounded-full w-[42px] h-[42px] overflow-hidden relative shadow-m z-[100]'}
                    >
                        <View className='flex flex-col items-center justify-center relative overflow-hidden h-full w-full'>
                                <Ionicons name='chevron-back-outline' size={28} className='right-1.25' />
                        </View>
                    </AnimatedMaterialRipple>
                    <View className="flex flex-row items-center justify-end flex-1">
                        <ActionButton name='ellipsis-vertical' />
                    </View>
                </View>
            </BlurView>
        </View>
    )
};

const FooterComponent = ({ imageIndex }: { imageIndex: number }) => {
    return (
        <SafeAreaView>
            {Platform.OS === 'ios' ? (
                <BlurView intensity={70} tint="light" experimentalBlurMethod="dimezisBlurView"  className="w-[90%] min-h-16 absolute bottom-10 overflow-hidden shadow-sm bg-white border border-gray-100 mx-4 self-center rounded-full left-[100/2] flex flex-row items-center justify-center z-50">
                    <FooterComponentContent />
                </BlurView>
            ) : (
                <View className="w-full min-h-16 bg-white relative flex flex-row items-center justify-center z-[100]">
                    <FooterComponentContent />
                </View>
            )}
        </SafeAreaView>
    )
};

const FooterComponentContent = () => {
    return (
        <View className='flex flex-1 w-full flex-row items-center justify-center gap-[2.2rem] px-6 py-4'>
            <ActionButton name='heart-outline' />
            <ActionButton name='information-circle-outline' />
            <ActionButton name={Platform.OS === 'ios' ? 'share-outline' : 'share-social-outline'} />
            <ActionButton name='trash-outline' />
        </View>
    )
}

const ActionButton = ({ name }: { name: string }) => {
    return (
        <AnimatedMaterialRipple
            rippleCentered
            rippleDuration={400}
            className={'flex flex-col rounded-full w-[42px] h-[42px] overflow-hidden relative shadow-m z-[100]'}
        >
            <View className='flex flex-col items-center justify-center relative overflow-hidden h-full w-full'>
                <Ionicons name={name as any} size={24} />
            </View>
        </AnimatedMaterialRipple>
    )
}


export default ImageViewer;