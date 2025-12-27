import { Text, View } from "react-native";
import { SharingProgressProps } from "@/types";
import ProgressBar from "./ProgressBar";
import MaterialRipple from 'react-native-material-ripple';

const PrepareSharing = ({ progress, onCancel }: { progress: SharingProgressProps, onCancel: () => void }) => {
      return (
            <View className='flex h-full w-full absolute z-[1000] bg-[#11111190]'>
                  <View className='flex flex-col h-full w-full relative items-center justify-center px-4'>

                        {/* Progress Container */}
                        <View className='flex flex-col relative bg-white rounded-3xl w-full overflow-hidden'>
                              <View className='px-4 py-4 relative flex flex-col w-full'>
                                    <View className='flex flex-row items-center justify-center w-full relative mb-2'>
                                          <Text className='text-xl text-black'>Preparing {progress.current} of {progress.total}</Text>
                                    </View>
                                    <View className='my-2'>
                                          <ProgressBar progress={progress.progress} />
                                    </View>
                              </View>
                              <View className='border-t border-gray-100'>
                                    <MaterialRipple onPress={onCancel} className='flex flex-col w-full items-center justify-center h-[45px]'>
                                          <View className='h-full w-full relative items-center justify-center'>
                                                <Text className='text-lg text-red-500'>Cancel</Text>
                                          </View>
                                    </MaterialRipple>
                              </View>
                        </View>
                        {/* Progress Container */}

                  </View>
            </View>
      )
}

export default PrepareSharing;