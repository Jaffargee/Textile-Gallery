import { Alert } from 'react-native';

export type Logger = {
      info?: (message: string, ...args: any[]) => void;
      error?: (message: string, ...args: any[]) => void;
};

export const createUILogger = (): Logger => ({
      info: (message: string, ...args: any[]) => {
            // For info, perhaps show a toast or nothing
            // For now, do nothing or use Alert for demo
            console.log('Info:', message, ...args); // Keep for dev, remove in prod
      },
      error: (message: string, ...args: any[]) => {
            // Display error on UI using Alert
            Alert.alert(
                  'Error',
                  `${message}\n${args.map(arg => (arg instanceof Error ? arg.message : String(arg))).join(' ')}`,
                  [{ text: 'OK' }]
            );
            // Also log to console for debugging
            console.error('Error:', message, ...args);
      },
});

export const uiLogger = createUILogger();