import React, { useEffect, useState, useCallback } from 'react';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { STRIPE_PUBLISHABLE_KEY, isStripePublishableKeyConfigured } from './src/config/config';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

let StripeProvider: any = null;
if (!isExpoGo) {
  try {
    StripeProvider = require('@stripe/stripe-react-native').StripeProvider;
  } catch {
    // native modül yok
  }
}

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appReady, setAppReady] = useState(false);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      setAppReady(true);
    }
  }, [fontsLoaded]);

  const onLayoutRootView = useCallback(async () => {
    if (appReady) {
      await SplashScreen.hideAsync();
    }
  }, [appReady]);

  if (!appReady) {
    return null;
  }

  const content = (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      {StripeProvider && isStripePublishableKeyConfigured() ? (
        <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
          {content}
        </StripeProvider>
      ) : (
        content
      )}
    </View>
  );
}
