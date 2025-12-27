import { Alert, Text, TextInput, View } from 'react-native'
import MatetrialRipple from 'react-native-material-ripple'
import React from 'react'
import { TGMediaRepository } from '@/lib/file-manager';
import { AlbumProps } from '@/types';
import { AlbumRepo } from '@/lib/database';
import DBWithCache from '@/lib/cache-db';

const AlbumModal = ({ setOpen }: { setOpen: (state: boolean) => void }) => {

      const [albumName, setAlbumName] = React.useState<string>('');

      const handleCreateAlbum = async () => {

            // Logic to create album
            const dbWithCache = await DBWithCache.getInstance();
            
            try {
                  const { created } = await TGMediaRepository.createDirs([{source: {local_uri: `${TGMediaRepository.constructPath(TGMediaRepository.ALBUM_NAME + '/' + albumName)}`}} as AlbumProps]);

                  
                  if(created.length > 0) {

                        let cloud_id_prefix = 'dir-gallery-';
                        let cloud_id = cloud_id_prefix + albumName;
      
                        await AlbumRepo.insertAlbum(dbWithCache.repo.getDb(), [cloud_id, albumName, created[0].source?.local_uri, '']);
      
                        dbWithCache.clearAllCache();
                        console.log('Album created successfully:', created[0].source?.local_uri);
                        Alert.alert('Success', 'Album created successfully!');


                  } else {
                        console.log('Failed to create album.');
                        Alert.alert('Error', 'Failed to create album.');
                  }
                  
            } catch (error) {
                  console.log('Modal Creation Directory: ', error);
            }
      }


      return (
            <View className='flex flex-col absolute top-0 left-0 z-[10000] bg-[#00000090] h-full w-full'>
                  <View className='flex flex-1 h-full w-full relative justify-end px-2 pb-8'>

                        {/* Main Container */}
                        <View className='flex relative rounded-3xl bg-gray-800 px-6 py-4 shadow-lg gap-2 border border-gray-800'>
                              <View className='flex flex-row items-center justify-start w-full'>
                                    <Text className='text-white text-xl'>Create album</Text>
                              </View>
                              <View className='flex flex-col w-full relative mb-2'>
                                    <TextInput value={albumName} onChangeText={(value) => setAlbumName(value)} placeholder='Album name' className='border-b-white border-b-2 rounded-md w-full bg-transparent px-3 text-lg text-white' />
                              </View>
                              <View className='flex flex-row items-center w-full relative gap-2'>
                                    <MatetrialRipple onPress={() => setOpen(false)} rippleDuration={400} rippleColor='#dbdbdbb0' className={'overflow-hidden max-h-[50px] rounded-full bg-gray-800 flex-1'}>
                                          <View className='flex h-full w-full relative px-4 py-3 items-center justify-center'>
                                                <Text className='text-white text-xl'>Cancel</Text>
                                          </View>
                                    </MatetrialRipple>
                                    <View className='h-[40%] w-[2px] rounded-full bg-gray-500' />
                                    <MatetrialRipple onPress={handleCreateAlbum} rippleDuration={400} rippleColor='#dbdbdbb0' className={'overflow-hidden max-h-[50px] rounded-full bg-gray-800 flex-1'}>
                                          <View className='flex h-full w-full relative px-4 py-3 items-center justify-center'>
                                                <Text className='text-white text-xl'>Create</Text>
                                          </View>
                                    </MatetrialRipple>
                              </View>
                        </View>
                        {/* Main Container */}

                  </View>
            </View>
      )
}

export default AlbumModal

