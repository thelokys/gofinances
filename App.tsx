import 'intl'
import 'intl/locale-data/jsonp/pt-BR'

import React from 'react';
import AppLoading from 'expo-app-loading';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins'

import { ThemeProvider } from 'styled-components';
import theme from './src/global/styles/theme'
import { NavigationContainer } from '@react-navigation/native'

import { AppRoutes } from './src/routes/app.routes'
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold
  })

  if(!fontsLoaded) {
    return <AppLoading />
  }

  return (
    <ThemeProvider theme={theme}>
       <GestureHandlerRootView style={{flex : 1}}>
        <NavigationContainer>
          <AppRoutes/>
        </NavigationContainer>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}