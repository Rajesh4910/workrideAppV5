declare module 'lodash.debounce';
declare module 'expo-location' {
  export const requestForegroundPermissionsAsync: any;
  export const watchPositionAsync: any;
  export enum Accuracy {}
}
declare module 'react-native-maps' {
  import { Component } from 'react';
  import { ViewProps } from 'react-native';
  export type Region = { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number };
  export interface MapViewProps extends ViewProps {
    initialRegion?: Region;
    region?: Region;
    showsUserLocation?: boolean;
  }
  export class MapView extends Component<MapViewProps> {}
  export const Marker: any;
  export default MapView;
}
