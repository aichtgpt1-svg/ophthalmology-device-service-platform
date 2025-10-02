import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import API from '../services/api';
import { getCachedDevices, cacheDevices } from '../services/offlineCache';

export default function DeviceListScreen({ navigation }: any) {
  const [devices, setDevices] = useState<any[]>([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const { data } = await API.get('/devices');
      setDevices(data);
      await cacheDevices(data);
    } catch (e) {
      const cached = await getCachedDevices();
      setDevices(cached);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Devices</Text>
      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('PhotoReport', { deviceId: item.id })}>
            <Text style={styles.serial}>{item.serial_number}</Text>
            <Text>{item.manufacturer} - {item.model}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, marginBottom: 12 },
  card: { backgroundColor: '#f2f2f2', padding: 12, marginVertical: 6, borderRadius: 6 },
  serial: { fontWeight: 'bold' },
});