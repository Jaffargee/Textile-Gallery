import * as FileSystem from 'expo-file-system/legacy';
import * as RNFS from 'react-native-fs';
import { uiLogger } from '../logger';

type DownloadFileProps = {
      url: string,
      filePath: string,
      callback_fn: (download_progress: FileSystem.DownloadProgressData) => void
}

type Logger = {
      info?: (message: string, ...args: any[]) => void;
      error?: (message: string, ...args: any[]) => void;
};

const ROOT_DIR: string = FileSystem.documentDirectory as string;
const APP_ROOT_DIR: string = 'Tahir Gallery';

export default class DownloadManager {
      private logger: Logger;

      constructor(logger?: Logger) {
            this.logger = logger || uiLogger;
      }

      async validPath(filePath: string): Promise<boolean> {
            try {
                  if (!filePath.startsWith(ROOT_DIR)) {
                        return false;
                  }
      
                  const info = await FileSystem.getInfoAsync(ROOT_DIR + APP_ROOT_DIR);
                  
                  if (!info.exists) {
                        return false;
                  }
      
                  if (!info.isDirectory) {
                        return false;
                  }
      
                  return true;
                  
            } catch {
                  return false
            }
      }

      private async ensureDirectoryExists(filePath: string): Promise<void> {
            const dirPath = filePath.substring(0, filePath.lastIndexOf('/'));
            if(!(await this.validPath(dirPath))) return
            try {
                  const info = await FileSystem.getInfoAsync(dirPath);
                  // Only create if path doesn't exist OR exists but isn't a directory
                  if (!info.exists) {
                        await RNFS.mkdir(dirPath);
                  } else if (!info.isDirectory) {
                        throw new Error(`Path exists but is not a directory: ${dirPath}`);
                  }
                  // If exists and is directory, do nothing
            } catch {
                  // If getInfoAsync fails (path doesn't exist), create it
                  await RNFS.mkdir(dirPath);
            }
      }

      async downloadFile({ url, filePath, callback_fn }: DownloadFileProps): Promise<{uri: string, downloaded: boolean}> {
            const directoryPath = filePath.substring(0, filePath.lastIndexOf('/'));

            try {
                  await this.ensureDirectoryExists(directoryPath); // Pass only the directory, not the full file path
            } catch {
                  return { uri: filePath, downloaded: false }; 
            }

            try {
                  // Check if file already exists to avoid re-downloading
                  const fileInfo = await FileSystem.getInfoAsync(filePath);
                  if (fileInfo.exists) {
                        return { uri: filePath, downloaded: true };
                  }

                  const downloadResumable = FileSystem.createDownloadResumable(url, filePath, {}, callback_fn);

                  const response = await downloadResumable.downloadAsync();

                  if (response?.status === 200) {
                        const stats = await RNFS.stat(filePath);
                        if (stats.size > 0) {
                              return { uri: filePath, downloaded: true };
                        } else {
                              await FileSystem.deleteAsync(filePath, { idempotent: true });
                              return { uri: filePath, downloaded: false };
                        }
                  } else {
                        return { uri: filePath, downloaded: false };
                  }

            } catch {
                  try {
                        const fileInfo = await FileSystem.getInfoAsync(filePath);
                        if (fileInfo.exists) {
                              await FileSystem.deleteAsync(filePath, { idempotent: true });
                        }
                  } catch (cleanupError) {
                        this.logger?.error?.('Failed to clean up partial download:', cleanupError);
                  }

                  return { uri: filePath, downloaded: false };
            }
      }

}
