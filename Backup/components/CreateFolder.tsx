import { useState } from "react";
import { KeyboardAvoidingView, Platform, Text, TextInput, TextInputProps, View } from "react-native";
import MaterialRipple from 'react-native-material-ripple';

const CreateFolder = () => {
      return (
            <View className='flex flex-1 h-full w-full absolute z-[1000] bg-[#11111190]'>
                  <View className='flex flex-1 h-full w-full relative items-center justify-end py-6 px-4'>
                        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={80} className='flex flex-1 h-full w-full relative items-center justify-center'>
                              <View className='rounded-3xl bg-white px-4 py-4 gap-2 w-full overlfow-hidden shadow-md border border-[#eeeeee20]'>
                                    <Text className='text-black text-2xl mb-2'>Create a new folder</Text>
                                    <InputField placeholder='New Folder' />
                                    <View className='flex flex-row gap-2 mb-2 h-[50px]'>
                                          <MaterialRipple rippleColor='rgba(255, 255, 255, 0.41)' rippleOpacity={50} rippleDuration={300} className='bg-[#222] rounded-full overflow-hidden h-full flex-1 px-4 shadow-sm'>
                                                <View className='flex flex-row items-center justify-center gap-2 h-full'>
                                                      <Text className='text-white text-lg'>Cancel</Text>
                                                </View>
                                          </MaterialRipple>
                                          <MaterialRipple rippleColor='rgba(255, 255, 255, 0.41)' rippleOpacity={50} rippleDuration={300} className='bg-primary rounded-full overflow-hidden h-full flex-1 px-4 shadow-sm'>
                                                <View className='flex flex-row items-center justify-center gap-2 h-full'>
                                                      <Text className='text-white text-lg'>Create</Text>
                                                </View>
                                          </MaterialRipple>
                                    </View>
                              </View>
                        </KeyboardAvoidingView>
                  </View>
            </View>
      )
}


const InputField = ({ ...rest }: TextInputProps) => {
      const [isFocused, setIsFocused] = useState(false);
      return (
            <TextInput style={{lineHeight: 18}}
                  {...rest} 
                  className={`
                        relative mb-2 h-[53px] w-full rounded-lg px-4 pl-6 text-black text-lg bg-white
                        ${isFocused ? 'border-2 border-primary' : 'border border-gray-200'}
                  `}
                  placeholderTextColor={'gray'}
                  placeholderClassName='px-4'
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
            />
      )
}

export default CreateFolder;