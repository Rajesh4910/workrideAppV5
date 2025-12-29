import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../state/AuthContext';

// ✅ Keep your existing screen names
import LoadingScreen from '../screens/LoadingScreen';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import LoginScreen from '../screens/LoginScreen';
import CountrySelectionScreen from '../screens/CountrySelectionScreen';

import HostTabs from './HostTabs';
import RiderTabs from './RiderTabs';

// ✅ Host detail screens (optional, but implemented here)
import HostRequestDetailsScreen from '../screens/host/HostRequestDetailsScreen';
import HostChatThreadScreen from '../screens/host/HostChatThreadScreen';
import RiderChatThreadScreen from '../screens/rider/RiderChatThreadScreen';
import RiderTrackHostScreen from '../screens/rider/RiderTrackHostScreen';

export type RootStackParamList = {
  Loading: undefined;
  RoleSelection: undefined;
  Login: undefined;
  CountrySelection: undefined;
  HostApp: undefined;
  RiderApp: undefined;
  HostRequestDetails: { id: string } | undefined;
  HostChatThread: { id: string; name: string };
  RiderChatThread: { id: string; name: string };
  RiderTrackHost: { rideId: string } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isReady, role } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isReady ? (
        <Stack.Screen name="Loading" component={LoadingScreen} />
      ) : role === 'HOST' ? (
        <>
          <Stack.Screen name="HostApp" component={HostTabs} />
          <Stack.Screen name="HostRequestDetails" component={HostRequestDetailsScreen} />
          <Stack.Screen name="HostChatThread" component={HostChatThreadScreen} />
          <Stack.Screen name="RiderChatThread" component={RiderChatThreadScreen} />
          <Stack.Screen name="RiderTrackHost" component={RiderTrackHostScreen} />
        </>
      ) : role === 'RIDER' ? (
        <Stack.Screen name="RiderApp" component={RiderTabs} />
      ) : (
        <>
          <Stack.Screen name="CountrySelection" component={CountrySelectionScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
          {/* Fallback screens to avoid navigation crashes before role is set */}
          <Stack.Screen name="HostApp" component={HostTabs} />
          <Stack.Screen name="RiderApp" component={RiderTabs} />
          <Stack.Screen name="HostRequestDetails" component={HostRequestDetailsScreen} />
          <Stack.Screen name="HostChatThread" component={HostChatThreadScreen} />
          <Stack.Screen name="RiderChatThread" component={RiderChatThreadScreen} />
          <Stack.Screen name="RiderTrackHost" component={RiderTrackHostScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}