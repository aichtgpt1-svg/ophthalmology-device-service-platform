import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import API from '../services/api';
import { getCachedDevices, cacheDevices } from '../services/offlineCache';
import { showLocal } from '../services/pushNotifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DueBadge from '../components/DueBadge';




export default function DashboardScreen({ navigation }: any) {
  const [devices, setDevices] = useState<any[]>([]);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    load();
    const id = setInterval(load, 30000); // 30 s poll
    return () => clearInterval(id);
  }, []);

  const load = async () => {
    try {
      const { data } = await API.get('/devices');
      setDevices(data);
      await cacheDevices(data);
      setOffline(false);
    } catch (e) {
      // offline – use cache
      const cached = await getCachedDevices();
      setDevices(cached);
      setOffline(true);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    navigation.replace('Login');
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {offline && <Text style={{ color: 'orange' }}>OFFLINE – using cached data</Text>}
      <Text style={{ fontSize: 22, marginBottom: 12 }}>Dashboard</Text>
	  <Text style={{ fontSize: 22 }}>Dashboard <DueBadge /></Text>
      <Button title="Device List" onPress={() => navigation.navigate('DeviceList')} />
	  <Button title="Take Photo Report" onPress={() => navigation.navigate('PhotoReport')} />
      
      <View style={{ marginTop: 20 }}>
        <Button title="Logout" onPress={logout} />
      </View>
    </View>
  );
}