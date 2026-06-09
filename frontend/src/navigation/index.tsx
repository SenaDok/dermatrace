
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { colors } from '../theme';
import {
  LoginScreen, RegisterScreen, ProcedureSetupScreen,
  DashboardScreen, CheckinScreen, TimelineScreen,
  ScannerScreen, AlertsScreen, ProfileScreen,
} from '../screens';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

function TabIcon({ icon, label, focused }: { icon: string; label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', paddingTop: 4 }}>
      <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.45 }}>{icon}</Text>
      <Text style={{ fontSize: 9, color: focused ? colors.sage600 : colors.gray400, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.gray100,
          borderTopWidth: 0.5,
          height: 80,
        },
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="🏠" label="Home" focused={focused} /> }} />
      <Tab.Screen name="Timeline" component={TimelineScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="📈" label="Timeline" focused={focused} /> }} />
      <Tab.Screen name="Checkin" component={CheckinScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="📋" label="Check-in" focused={focused} /> }} />
      <Tab.Screen name="Scanner" component={ScannerScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="🔍" label="Scanner" focused={focused} /> }} />
      <Tab.Screen name="Alerts" component={AlertsScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="🔔" label="Alerts" focused={focused} /> }} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login"          component={LoginScreen} />
      <Stack.Screen name="Register"       component={RegisterScreen} />
      <Stack.Screen name="ProcedureSetup" component={ProcedureSetupScreen} />
      <Stack.Screen name="Main"           component={MainTabs} />
      <Stack.Screen name="Profile"        component={ProfileScreen}
        options={{ headerShown: true, title: 'Profile', headerBackTitle: 'Back' }} />
    </Stack.Navigator>
  );
}
