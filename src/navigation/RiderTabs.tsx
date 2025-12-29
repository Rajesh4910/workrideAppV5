import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../utils/theme';

// ✅ Existing screen names (as per your project structure)
import RiderHomeScreen from '../screens/rider/RiderHomeScreen';
import RiderTripsScreen from '../screens/rider/RiderTripsScreen';
import RiderAccountScreen from '../screens/rider/RiderAccountScreen';

// If you don't have a RiderInboxScreen yet, keep this file (included in this update)
import RiderInboxScreen from '../screens/rider/RiderInboxScreen';
import RiderChatThreadScreen from '../screens/rider/RiderChatThreadScreen';
import type { RootStackParamList } from './RootNavigator';

export type RiderTabParamList = {
  Home: undefined;
  Trips: undefined;
  Inbox: undefined;
  Account: undefined;
};

const Tab = createBottomTabNavigator<RiderTabParamList>();

type RiderStackParamList = {
  RiderMain: undefined;
  RiderChatThread: RootStackParamList['RiderChatThread'];
};

const Stack = createNativeStackNavigator<RiderStackParamList>();

function RiderTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.brand,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarStyle: {
          borderTopColor: Colors.border,
          backgroundColor: '#fff',
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const map: Record<string, any> = {
            Home: focused ? 'home' : 'home-outline',
            Trips: focused ? 'car' : 'car-outline',
            Inbox: focused ? 'chatbubble' : 'chatbubble-outline',
            Account: focused ? 'person' : 'person-outline',
          };
          return <Ionicons name={map[route.name] ?? 'ellipse'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={RiderHomeScreen} />
      <Tab.Screen name="Trips" component={RiderTripsScreen} />
      <Tab.Screen name="Inbox" component={RiderInboxScreen} />
      <Tab.Screen name="Account" component={RiderAccountScreen} />
    </Tab.Navigator>
  );
}

export default function RiderTabs() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RiderMain" component={RiderTabNavigator} />
      <Stack.Screen name="RiderChatThread" component={RiderChatThreadScreen} />
    </Stack.Navigator>
  );
}
