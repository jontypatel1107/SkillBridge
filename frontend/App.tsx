import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { Provider } from "react-redux";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { store } from "@/redux/store";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { RootNavigator } from "@/navigation/RootNavigator";
import { useAppFonts } from "@/theme/useAppFonts";
import { getServerUrls } from "@/config/serverUrl";

export default function App() {
  const fontsLoaded = useAppFonts();

  useEffect(() => {
    getServerUrls();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <SafeAreaProvider>
          <ThemeProvider>
            <StatusBar style="auto" />
            <RootNavigator />
          </ThemeProvider>
        </SafeAreaProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
