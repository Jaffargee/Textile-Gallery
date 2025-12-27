import { Text, View } from 'react-native'
import React from 'react'
import MaterialRipple from 'react-native-material-ripple';
import { useProgress } from '@/hooks/progress-context';
import ProgressBar from './ProgressBar';

const ProgressContainer = () => {
      const { syncProgress } = useProgress(); // Example progress value      const album_images = new Map();

      if (!syncProgress.total) {
            return <></>
      }

      return (
            <View className='flex z-[10000] bg-[#00000090] absolute w-full h-full'>
                  <View className='flex flex-1 h-full w-full justify-end pb-20 px-2'>

                        <View className='w-full bg-white rounded-[30px] items-center justify-center'>
                              <View className='flex flex-col w-full relative px-6 py-4'>
                                    
                                    <View className='flex flex-row w-full items-start justify-between relative'>
                                          <Text className='text-xl text-black'>Syncing Images...</Text>
                                          <Text className='text-xl text-black'>Batch: {syncProgress.current_batch}/{syncProgress.total_batch}</Text>
                                    </View>

                                    <View className='w-full my-4 flex flex-row items-center justify-start relative'>
                                          <ProgressBar progress={syncProgress.percentage ?? 0} />
                                    </View>

                                    <View className='flex flex-row w-full items-center justify-between relative'>
                                          <View className='flex flex-col items-center justify-center'>
                                                <Text>{syncProgress.current ?? 0}/{syncProgress.total ?? 0}</Text>
                                          </View>
                                          <View className='flex flex-col items-center justify-center'>
                                                <Text>{(syncProgress.percentage ?? 0).toFixed(0)}%</Text>
                                          </View>
                                    </View>

                                    <View className='flex w-full my-2 relative'>
                                          <MaterialRipple
                                                rippleDuration={300}
                                                className='w-full h-[40px] rounded-3xl flex-row items-center justify-center overflow-hidden'
                                          >
                                                <View className='flex w-full items-center justify-center px-4'>
                                                      <Text className='text-xl'>Cancel</Text>
                                                </View>
                                          </MaterialRipple>
                                    </View>

                              </View>
                        </View>

                  </View>
            </View>
      )
}

export default ProgressContainer;

