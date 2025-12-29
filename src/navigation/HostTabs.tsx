import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../utils/theme';

// ✅ Existing screen names (as per your project structure)
import HostDashboardScreen from '../screens/host/HostDashboardScreen';
import HostRequestsScreen from '../screens/host/HostRequestsScreen';
import HostCreateRideScreen from '../screens/host/HostCreateRideScreen';
import HostInboxScreen from '../screens/host/HostInboxScreen';
import HostEarningsScreen from '../screens/host/HostEarningsScreen';

export type HostTabParamList = {
  Dashboard: undefined;
  Requests: undefined;
  Create: undefined;
  Inbox: undefined;
  Earnings: undefined;
};

const Tab = createBottomTabNavigator<HostTabParamList>();

export default function HostTabs() {
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
            Dashboard: focused ? 'grid' : 'grid-outline',
            Requests: focused ? 'albums' : 'albums-outline',
            Create: focused ? 'add-circle' : 'add-circle-outline',
            Inbox: focused ? 'chatbubble' : 'chatbubble-outline',
            Earnings: focused ? 'cash' : 'cash-outline',
          };
          return <Ionicons name={map[route.name] ?? 'ellipse'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={HostDashboardScreen} />
      <Tab.Screen name="Requests" component={HostRequestsScreen} />
      <Tab.Screen name="Create" component={HostCreateRideScreen} />
      <Tab.Screen name="Inbox" component={HostInboxScreen} />
      <Tab.Screen name="Earnings" component={HostEarningsScreen} />
    </Tab.Navigator>
  );
}
