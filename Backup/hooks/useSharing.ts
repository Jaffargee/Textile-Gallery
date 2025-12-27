import * as Sharing from 'expo-sharing';
import Share from 'react-native-share';

export async function shareMultipleImages(localUris: string[]) {
      if (localUris.length === 0) {
            console.warn("No files selected for sharing.");
            return;
      }

      // Check if the device supports sharing files
      // if (!(await Sharing.isAvailableAsync())) {
      //       alert('Sharing is not available on your device.');
      //       return;
      // }

      try {
            // Sharing.shareAsync can accept an array of URIs starting from Expo SDK 43+
            // await Sharing.shareAsync(localUris[0] as any);

            const shareOptions = {
                  title: 'Share Images',
                  urls: localUris,
                  type: 'image/jpeg'
            }

            Share.open(shareOptions)
            .then(res => console.log(res))
            .catch(err => console.log(err))

            // {
            //             mimeType: 'image/*',
            //             dialogTitle: 'Share Images via...',
            //       }

            // if (result.action === Sharing.dismissedAction) {
            //       console.log("Sharing dismissed by user.");
            // } else if (result.action === Sharing.sharedAction) {
            //       console.log("Files successfully shared.");
            // }

      } catch (error) {
            console.error("Error sharing files:", error);
            alert('Failed to share files. Please try again.');
      }
}