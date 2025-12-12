import { useFonts } from 'expo-font';

export default function useLoadFonts() {
    const [fontsLoaded] = useFonts({
        'HelveticaNeue': require('../assets/fonts/helveticaneue.ttf'),
        'HelveticaNeue-Medium': require('../assets/fonts/helveticaneue-medium.ttf'),
        'HelveticaNeue-Bold': require('../assets/fonts/helveticaneue-bold.ttf'),
    });

    return fontsLoaded;
}
