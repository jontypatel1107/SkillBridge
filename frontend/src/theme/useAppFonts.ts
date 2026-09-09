import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts as useInterFonts,
} from "@expo-google-fonts/inter";
import {
  Fraunces_500Medium,
  Fraunces_600SemiBold,
  useFonts as useFrauncesFonts,
} from "@expo-google-fonts/fraunces";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

export function useAppFonts() {
  const [interLoaded] = useInterFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [frauncesLoaded] = useFrauncesFonts({
    Fraunces_500Medium,
    Fraunces_600SemiBold,
  });

  const loaded = interLoaded && frauncesLoaded;

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loaded]);

  return loaded;
}