import { Image } from 'react-native';

export default function getImageSize(uri: string, onSuccess: (width: number, height: number) => void, onError: (error: any) => void) {
    Image.getSize(
        uri,
            (width, height) => {
                  onSuccess(width, height);
            },
            (error) => {
                  onError(error);
            }
    );
}