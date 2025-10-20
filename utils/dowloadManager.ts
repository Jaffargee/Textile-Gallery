import * as FileSystem from 'expo-file-system/legacy';
import { Directory, File, Paths } from 'expo-file-system'; // Explicitly import the type
import { FileProps, FolderProps } from '@/types';


export default class DownloadManager {
      static instance: DownloadManager;
      private cache: Map<string, File[]>;
      private appDirectoryName: string = 'Tahir Gallery';

      private constructor() {
            this.cache = new Map();
            this.downloadCallback = this.downloadCallback.bind(this)
      }

      static getInstance() {
            if (!DownloadManager.instance) {
                  DownloadManager.instance = new DownloadManager();
            }
            return DownloadManager.instance;
      }

      downloadCallback(downloadProgress: FileSystem.DownloadProgressData) {
            const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
            // totalBytesExpectedToWrite will be -1 if the server doesn't provide a Content-Length header!
            if (downloadProgress.totalBytesExpectedToWrite > 0) {
                  console.log(`Download progress: ${(progress * 100).toFixed(2)}%`);
            }
      };

      async downloadFileWithProgress(fileUrl: string, destionation: string): Promise<File | any> {
            const downloadResumable = FileSystem.createDownloadResumable(
                  fileUrl,
                  destionation,
                  {},
                  this.downloadCallback
            );
            const file = await downloadResumable.downloadAsync();
            try {
                  if(file){
                        const { uri } = file;
                        return { uri, name: uri.split('/').pop() || `file_${Date.now()}` };
                  }
            } catch (e) {
                  console.error('Download error:', e);
            }
      }

      destructAndConstructFileUrl(files: FolderProps[]): FileProps[] {
            return files.map(file => {
                  const fileName = file.uri.split('/').pop();
                  return { uri: file.uri, name: fileName, dir_name: file.name };
            }) as FileProps[];
      }

      constructFilePath(relativePath: string, filename: string): string {
            const filePath = `${this.appDirectoryName}/${relativePath}/${filename}`
            return new Directory(Paths.document, filePath).uri
      }

      async downloadFiles(files: FileProps[], dir_name: string) {
            return files.map(async (file) => {
                  console.log(file.uri, dir_name, file.name)
                  return await this.downloadFileWithProgress(file.uri, this.constructFilePath(dir_name, file.name))
            })
      }
      
      clearCache() {
            console.log("🗑️ Clearing download cache");
            this.cache.clear();
      }

}
            




















// async downloadFiles(urls: string[], downloadDir: string): Promise<File[]> {
//       if (this.cache.has(downloadDir)) {
//             console.log("📦 Returning cached downloads");
//             return this.cache.get(downloadDir) as File[];
//       }
//       await this.ensureDirExists(downloadDir);

//       const downloadPromises = urls.map(async (url) => {
//             const fileName = url.split('/').pop() || `file_${Date.now()}`;
//             const filePath = Paths.join(downloadDir, fileName);
//             const { uri } = await FileSystem.downloadAsync(url, filePath);
//             return { uri, name: fileName };
//       }

//       );

//       const files = await Promise.all(downloadPromises);
//       this.cache.set(downloadDir, files);
//       console.log(`✅ Downloaded and cached ${files.length} files to ${downloadDir}`);
//       return files;
// }
// private async ensureDirExists(dir: string) {
//       const dirInfo = await FileSystem.getInfoAsync(dir);
//       if (!dirInfo.exists) {
//             console.log(`📁 Creating directory: ${dir}`);
//             await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
//       }
// }
