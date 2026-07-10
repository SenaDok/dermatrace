
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

function TabDot({ focused }: { focused: boolean }) {
  return (
    <View style={{
      width: 6, height: 6, borderRadius: 3,
      backgroundColor: focused ? colors.indigo : 'transparent',
      marginBottom: 4,
    }} />
  );
}

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', paddingTop: 6 }}>
      <TabDot focused={focused} />
      <Text style={{
        fontSize: 10, fontWeight: focused ? '700' : '500',
        color: focused ? colors.ink : colors.inkFaint,
      }}>
        {label}
      </Text>
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
          backgroundColor: colors.surface,
          borderTopColor: colors.line,
          borderTopWidth: 1,
          height: 78,
        },
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Home" focused={focused} /> }} />
      <Tab.Screen name="Timeline" component={TimelineScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Timeline" focused={focused} /> }} />
      <Tab.Screen name="Checkin" component={CheckinScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Check-in" focused={focused} /> }} />
      <Tab.Screen name="Scanner" component={ScannerScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Scanner" focused={focused} /> }} />
      <Tab.Screen name="Alerts" component={AlertsScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Alerts" focused={focused} /> }} />
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
