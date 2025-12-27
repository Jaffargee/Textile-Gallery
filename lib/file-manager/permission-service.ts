import { PermissionsAndroid, Platform } from 'react-native';

export class PermissionService {
    async requestStoragePermission() {
        try {
            if (Platform.OS === 'android') {

                // Check Android Version
                if (Platform.Version >= 33) {
                    // Android 13+
                    const granted = await PermissionsAndroid.requestMultiple([
                        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
                        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
                        PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO
                    ]);

                    const hasPermission =
                    granted["android.permission.READ_MEDIA_IMAGES"] === PermissionsAndroid.RESULTS.GRANTED ||
                    granted["android.permission.READ_MEDIA_VIDEO"] === PermissionsAndroid.RESULTS.GRANTED ||
                    granted["android.permission.READ_MEDIA_AUDIO"] === PermissionsAndroid.RESULTS.GRANTED;

                    return hasPermission;
                }
                else {
                    // Android 12 and below
                    const granted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
                    );
                    return granted === PermissionsAndroid.RESULTS.GRANTED;
                }
            }

            return true; // iOS doesn't need storage permission for app sandbox
        } catch (err) {
            console.warn(err);
            return false;
        }
    }
}
