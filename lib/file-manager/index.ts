import * as RNFS from 'react-native-fs'
import * as FileSystem from 'expo-file-system/legacy';
import { AlbumProps, ImageProps, SharingProgressProps } from '@/types';
import { ShareOpenResult } from 'react-native-share/lib/typescript/types'

export default class TGFileManager {
      private ALBUM_NAME: string = 'Tahir Gallery';
      static instance: TGFileManager;

      private constructor() {
            this.setupGallery = this.setupGallery.bind(this);
      }

      static getInstance() {
            if (!TGFileManager.instance) {
                  TGFileManager.instance = new TGFileManager();
            }
            return TGFileManager.instance;
      }

      private constructPath(album_path: string) {
            return `${FileSystem.documentDirectory}${album_path}`;
      }

      async setupGallery(): Promise<void> {

            let rootAlbum = await FileSystem.getInfoAsync(this.constructPath(this.ALBUM_NAME));

            if(!rootAlbum.exists) {
                  await RNFS.mkdir(this.constructPath(this.ALBUM_NAME));
                  console.log('✅ Root directory created');
            };

      }

      
      
}

export class TGMediaRepository {
      static ALBUM_NAME: string = 'Tahir Gallery';

      static constructPath(album_path: string = '/') {
            return `${FileSystem.documentDirectory}${album_path}`;
      }

      static async mkdir(dirPath: string): Promise<void> {
            if(!(await RNFS.exists(dirPath))) {
                  await RNFS.mkdir(dirPath);
            }
      }

      static async createDirs(dirs: AlbumProps[]): Promise<{ created: AlbumProps[], error: { dir: AlbumProps, reason: unknown }[] }> {
            
            if (dirs.length === 0) return { created: [], error: [] };
            
            const results = await Promise.allSettled(
                  dirs.map(async dir => {
                        try {
                              await this.mkdir(dir.source?.local_uri);
                              return { ok: true as const, dir };
                        } catch (err) {
                              return { ok: false as const, dir, reason: err };
                        }
                  })
            );
            
            const created: AlbumProps[] = [];
            const error: { dir: AlbumProps, reason: unknown }[] = [];

            for (const res of results) {
                  if (res.status === 'fulfilled' && res.value.ok) {
                        created.push(res.value.dir);
                  } else if (res.status === 'fulfilled' && !res.value.ok) {
                        error.push({ dir: res.value.dir, reason: res.value.reason });
                  } else if (res.status === 'rejected') {
                        error.push({ dir: dirs[results.indexOf(res)], reason: res.reason });
                  }
            }


            return { created, error };
      }

      static async listDir(dirPath: string = TGMediaRepository.constructPath()): Promise<RNFS.ReadDirItem[]> {
            if(await RNFS.exists(dirPath)){
                  return await RNFS.readDir(dirPath);
            }
            return []
      }

      static async delete(file: AlbumProps | ImageProps): Promise<void> {
            if(await RNFS.exists(file.source.local_uri)){
                  await FileSystem.deleteAsync(file.source.local_uri);
            }
      }

      static async deleteFile(filePath: string): Promise<void> {
            if(await RNFS.exists(filePath)){
                  await FileSystem.deleteAsync(filePath);
            }
      }

      static async prepareSharing(
            files: string[],
            setPreProgress: (progress: SharingProgressProps ) => void,
            setSelected: (uris: string[]) => void,
            setSelectionMode: (mode: boolean) => void,
            share: (files: string[]) => Promise<ShareOpenResult>
      ) {
            try {

                  let no_cpd_files = 0;

                  const preparedFiles = await Promise.all(
                        files.map(async (file) => {
                              const exists = await RNFS.exists(file);
                              if (!exists) return null;
                              
                              // By any chance if the full file path uri does not end with '/' the file name will be '/' and give error
                              let filename;
                              if (file[file.length -1] === '/') {
                                    filename = file.substring(0, file.lastIndexOf('/')).split('/').pop();
                              } else {
                                    filename = file.split('/').pop();
                              }
                              
                              const cacheDir = `${RNFS.TemporaryDirectoryPath}/${filename}`;

                              await RNFS.copyFile(file, cacheDir); // safer than moveFile

                              ++no_cpd_files;

                              setPreProgress({
                                    progress: no_cpd_files / files.length * 100,
                                    current: no_cpd_files,
                                    total: files.length
                              });

                              return "file://" + cacheDir; // ensure proper file:// prefix
                        })
                  );

                  const validFiles = preparedFiles.filter(f => f !== null);

                  if (validFiles.length === 0) {
                        console.log("No valid files to share");
                        return;
                  }

                  if (no_cpd_files === files.length) {
                        const shared = await share(validFiles);
                        if (shared.success) {
                              validFiles.map(async (file) => {
                                    await TGMediaRepository.deleteFile(file);
                              });

                              setSelected([]);
                              setSelectionMode(false)
                              setPreProgress({ progress: 0, current: 0, total: 0 });
                        } else if(shared.dismissedAction && !shared.success) {
                              setPreProgress({ progress: 0, current: 0, total: 0 });
                        }
                  }

            } catch (err) {
                  console.log("Share error:", err);
            }
      }


}