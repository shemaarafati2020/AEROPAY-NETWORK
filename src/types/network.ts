export type NetworkState = {
  isConnected: boolean;
  isInternetReachable: boolean;
  connectionType: 'wifi' | 'cellular' | 'none';
};
