import { useEffect } from "react";
import { BackHandler } from "react-native";


export default function useSelectionModeBackHandler(selectionMode: boolean, setSelectionMode: (mode: boolean) => void, setSelected: (selected: any[]) => void) {
      useEffect(() => {
            const backAction = () => {
                  if(selectionMode){
                        setSelectionMode(false);
                        setSelected([]);
                        return true; // Prevent default back action
                  }
            };

            const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

            return () => backHandler.remove(); // Cleanup when component unmounts
      }, [selectionMode, setSelected, setSelectionMode]);
}