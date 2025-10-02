import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { initPush } from './src/services/pushNotifications';
import DeviceDetail from './pages/DeviceDetail';
export default function App() {
  useEffect(() => { initPush(); }, []);
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <AppNavigator />
    </>
  );
}