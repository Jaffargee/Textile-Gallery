import Share from 'react-native-share'

export default function useSharing() {
      const shareImages = async (files: string[]) => {
            try {
                  const result = await Share.open({ urls: files })
                  return result
            } catch (err) {
                  console.log(err);
                  throw err
            }
      }

      return { shareImages }

}