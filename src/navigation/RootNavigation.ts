import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from './RootNavigator';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function rootNavigate<RouteName extends keyof RootStackParamList>(
  name: RouteName,
  params?: RootStackParamList[RouteName]
) {
  if (navigationRef.isReady()) {
    // @ts-ignore navigate typing is fine at runtime
    navigationRef.navigate(name as any, params as any);
  } else {
    console.warn('Navigation container not ready — cannot navigate to', name);
  }
}

export default navigationRef;
