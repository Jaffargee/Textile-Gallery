import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert } from 'react-native';
import { ImageItem } from './image-service';

interface ImageProps extends ImageItem {
      filename?: string
}

export default function useImagePicker() {
      const [images, setImages] = useState<ImageProps[]>([]);
      const [loading, setLoading] = useState(false);

      const pickImages = async () => {
            try {
                  setLoading(true);
                  
                  // Request permission (recommended)
                  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                  if (status !== 'granted') {
                        Alert.alert('Permission required', 'Allow access to photos to select images.');
                        return;
                  }

                  let result = await ImagePicker.launchImageLibraryAsync({
                        allowsMultipleSelection: true,
                        quality: 1,
                  });

                  if (!result.canceled) {
                        const newImages = result.assets.map((asset, index) => ({
                              id: asset.assetId ?? asset.uri,
                              uri: asset.uri,
                              filename: asset.fileName || `image_${Date.now()}.jpg`,
                        }));
                        setImages(prev => [...prev, ...newImages.filter(img => !prev.some(p => p.id === img.id))]);
                        setLoading(false);
                  }
            } catch (error) {
                  Alert.alert('Error', 'Failed to pick images');
                  console.error(error);
            }
      };

      return {
            images,
            setImages,
            loading,
            setLoading,
            pickImages
      }

}