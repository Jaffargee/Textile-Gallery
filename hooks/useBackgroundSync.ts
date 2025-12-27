import DownloadManager from '@/utils/dowloadManager';
import { ImageDirProps, ImageItem } from '@/types';
import { useCallback, useEffect, useState } from 'react';
import { imageService } from '@/utils/image-service';
import { FileManager } from '@/utils/file-manager';
import { usePathname } from 'expo-router';


export default function useBackgroundSync(folder?: string) {
      const [cloudDirectories, setCloudDirectories] = useState<ImageDirProps[]>([]);
      // const [localImages, setLocalImages] = useState<(ImageItem | null)[]>([]);
      const [localAlbumImages, setLocalAlbumImages] = useState<(ImageDirProps | null)[]>([]);
      const [loading, setLoading] = useState<boolean>(true);

      const downloadManager = DownloadManager.getInstance();
      const fileManager = FileManager.getInstance()
      const pathName = usePathname()

      // fileManager.createDirectory('Tahir Gallery');

      const backgroundFolderSync = useCallback(async () => {

            setLoading(true);
            console.log('--- Starting Local Folder Sync ---');

            try{
                  const rootDirectory = await fileManager.listDir();
                  const albumPromises = rootDirectory.map(async (album, index) => {
      
                        // DEFENSIVE CHECK: Skip if not a directory object
                        if(!('list' in album)) return null;
                        const { uri, exists } = album;
      
                        // Construct Folder Name
                        const uriChunck = uri.split('/');
                        const folderNameEncoded = uriChunck[uriChunck.length - 2];
                        if (!folderNameEncoded) return null
                        const folderName = decodeURIComponent(folderNameEncoded);
      
                        try {
                              const dirLst = await fileManager.listDir(folderName);
                              const thumbnailUri = dirLst.length > 0 ? dirLst[0].uri : null
                              
                              // Constructed Directory Object
                              return {
                                    id: (index).toString(),
                                    name: folderName,
                                    no_items: dirLst.length,
                                    size: (album as any).size || 0,
                                    exists,
                                    source: { uri, thumbnailUri }
                              } as ImageDirProps;
                        } catch (e) {
                              console.error(`Failed to list subdirectory ${folderName}:`, e);
                              return null;
                        }
                  })
      
                  // Loading directory object for display
                  const constructedAlbums = (await Promise.all(albumPromises)).filter(a => a !== null);
                  setLocalAlbumImages(constructedAlbums);
                  console.log(`--- Finished Local Folder Sync (${constructedAlbums.length} albums) ---`);
            } catch (e) {
                  console.error('Loading local images failed:', e);
            } finally {
                  setLoading(false);
            }

      }, [fileManager])

      const backgroundFileSync = useCallback(async (folder: string) => {
            setLoading(true);
            console.log(`--- Starting Local Image Sync for ${folder} ---`);

            const loadFolderImages = await fileManager.listDir(folder);

            try {
                  const imagePromises = loadFolderImages.map((item, index): (ImageItem | null) => {

                        // 🛑 DEFENSIVE CHECK: Skip if it's a Directory object
                        if ('list' in item) return null; 

                        // CORRECT PATH PARSING: Get the name of the file
                        const fileNameEncoded = item.uri.split('/').pop();
                        if (!fileNameEncoded) return null;
                        const filename = decodeURIComponent(fileNameEncoded);

                        return {
                              id: (index).toString(),
                              size: (item as any).size || 0,
                              dir_name: folder,
                              name: filename,
                              exists: item.exists,
                              source: { uri: item.uri, thumbnailUri: item.uri },
                        } as ImageItem;

                  });

                  return imagePromises

            } catch (error) {
                  console.error('Loading local images failed:', error);
            } finally {
                  setLoading(false);
            }

      }, [fileManager]);

      async function fetchDirs() {
            const startTime = performance.now();
            try{
                  const dirs = await imageService.fetchImageDirectories('gallery', { limit: 150 });
                  setCloudDirectories(dirs);
                  await fileManager.createDirectories(dirs as ImageDirProps[])
                  const endTime = performance.now();
                  console.log(`✅ Loaded ${dirs.length} directories in ${(endTime - startTime).toFixed(0)}ms`);
            } catch (error) {
                  console.error('Failed to fetch directories:', error);
            }
      }

      async function fetchAndDownloadImages(folder: string) {
            const startTime = performance.now();
            console.log(`Fetching and downloading images from folder: ${folder}`)
            try{
                  const imgs = await imageService.fetchImages('gallery', { folder, limit: 150 });

                  const imgsItem2ImageItem = imgs as ImageItem[]

                  await  downloadManager.downloadFiles(imgsItem2ImageItem, folder)
                  console.log('Total Number of Images', imgsItem2ImageItem.length)

                  const endTime = performance.now();
                  console.log(`✅ Downloaded ${imgs.length} Images in ${(endTime - startTime).toFixed(0)}ms from cloud image directory ${folder}`);
            } catch (error) {
                  console.error('Failed to fetch directories:', error);
            }
      }

      async function downloadFiles() {
            if(cloudDirectories && cloudDirectories?.length > 0){
                  await Promise.all(cloudDirectories.map(async (folder) => {
                        await fetchAndDownloadImages(folder.name as string);
                  }));
            }
      }

      // useEffect(() => {
      //       async function functions() {
      //             if(pathName === '/'){
      //                   await backgroundFolderSync();
      //                   await fetchDirs();
      //                   // await downloadFiles();
      //             }
      //       }

      //       functions()

      // }, [backgroundFolderSync])

      
      return { loading, localAlbumImages, backgroundFileSync }
      
}







      
                  // async function fetchDirs() {
                  //       const startTime = performance.now();
                  //       try{
                  //             const dirs = await imageService.fetchImageDirectories('gallery', { limit: 150 });
                  //             setCloudDirectories(dirs);
                  //             await fileManager.createDirectories(dirs as ImageDirProps[])
                  //             const endTime = performance.now();
                  //             console.log(`✅ Loaded ${dirs.length} directories in ${(endTime - startTime).toFixed(0)}ms`);
                  //       } catch (error) {
                  //             console.error('Failed to fetch directories:', error);
                  //       }
                  // }
      
                  // async function fetchAndDownloadImages(folder: string) {
                  //       const startTime = performance.now();
                  //       console.log(`Fetching and downloading images from folder: ${folder}`)
                  //       try{
                  //             const imgs = await imageService.fetchImages('gallery', { folder, limit: 150 });
      
                  //             const imgsItem2ImageItem = imgs as ImageItem[]
      
                  //             await  downloadManager.downloadFiles(imgsItem2ImageItem, folder)
                  //             console.log('Total Number of Images', imgsItem2ImageItem.length)
      
                  //             const endTime = performance.now();
                  //             console.log(`✅ Downloaded ${imgs.length} Images in ${(endTime - startTime).toFixed(0)}ms from cloud image directory ${folder}`);
                  //       } catch (error) {
                  //             console.error('Failed to fetch directories:', error);
                  //       }
                  // }
      
                  // async function downloadFiles() {
                  //       if(cloudDirectories && cloudDirectories?.length > 0){
                  //             await Promise.all(cloudDirectories.map(async (folder) => {
                  //                   await fetchAndDownloadImages(folder.name as string);
                  //             }))
                  //       }
                  // }
      
                  // async function backgroundFolderSync(){
                  //       setLoading(true);
      
                  //       const loadAlbumImages = await fileManager.listDir();
      
                  //       try {
                  //             const contrustructAlbumsImages = await Promise.all(loadAlbumImages.map(async (album, index): Promise<ImageDirProps | null> => {
      
                  //                   const { uri, size, exists } = album;
                  //                   const folderNameEncodedArr = album.uri.split('/');
                  //                   const folderNameEncoded = folderNameEncodedArr[folderNameEncodedArr.length -2]
      
                  //                   if (!folderNameEncoded) {
                  //                         return null; // Should not happen if URI is valid
                  //                   }
                                    
                  //                   const folderName = decodeURIComponent(folderNameEncoded);
                                    
                  //                   if(!('list' in album)){
                  //                         return null
                  //                   }
      
                  //                   try {
                  //                         const dirList = (await fileManager.listDir(folderName));
                  //                         const thumbnailUri = dirList.length > 0 ? dirList[0].uri : null;
      
                  //                         return {
                  //                               id: (index).toString(),
                  //                               no_items: dirList.length,
                  //                               size,
                  //                               exists,
                  //                               name: folderName,
                  //                               source: {
                  //                                     uri,
                  //                                     thumbnailUri,
                  //                               }
                  //                         } as ImageDirProps;
      
                  //                   } catch (e) {
                  //                         console.error(`Failed to list subdirectory ${folderName}:`, e);
                  //                         return null; // Return null on error for this album
                  //                   }
      
                  //             }));
                              
                  //             if (contrustructAlbumsImages != null) {
                  //                   setLocalAlbumImages(contrustructAlbumsImages)
                  //             }
                              
                  //       } catch (error) {
                  //             console.log('Loading local images failed: =========>>>>>>>>>>>>>>', error);
                  //       } finally {
                  //             setLoading(false);
                  //       }
                  // }
      
                  // async function backgroundFileSync(folder: string = pathName.replaceAll('/', '')){
                  //       setLoading(true);
      
                  //       const loadFolderImages = await fileManager.listDir(folder);
      
                  //       try {
                  //             const contrustructFolderImages = await Promise.all(loadFolderImages.map(async (album, index): Promise<ImageItem | null> => {
      
                  //                   const { uri, size, exists } = album;
                  //                   const fileNameArr = album.uri.split('/');
                  //                   const fileNameEncoded = fileNameArr[fileNameArr.length -2]
      
                  //                   if('')
      
                  //                   if (!fileNameEncoded) {
                  //                         return null; // Should not happen if URI is valid
                  //                   }
                                    
                  //                   const filename = decodeURIComponent(fileNameEncoded);
      
                  //                   return {
                  //                         id: (index).toString(),
                  //                         size,
                  //                         dir_name: folder,
                  //                         name: filename,
                  //                         exists,
                  //                         source: {
                  //                               uri,
                  //                               thumbnailUri: uri,
                  //                         }
                  //                   } as ImageItem;
      
                  //             }));
                              
                  //             if (contrustructFolderImages != null) {
                  //                   setLocalImages(contrustructFolderImages)
                  //             }
                              
                  //       } catch (error) {
                  //             console.log('Loading local images failed: =========>>>>>>>>>>>>>>', error);
                  //       } finally {
                  //             setLoading(false);
                  //       }
                  // }
                  
                  // async function SyncAll() {
                  //       await Promise.all([])
                  // }
                  
                  // SyncAll();