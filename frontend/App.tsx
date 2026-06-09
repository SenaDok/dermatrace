
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { RootNavigator } from './src/navigation';
import { colors } from './src/theme';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.cream }}>
      <NavigationContainer>
        <RootNavigator />
        <StatusBar style="dark" backgroundColor={colors.cream} />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
