import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICES_KEY = 'cached_devices';
const SCHED_KEY = 'cached_maintenance';

export const cacheDevices = async (data: any) => AsyncStorage.setItem(DEVICES_KEY, JSON.stringify(data));
export const getCachedDevices = async () => {
  const raw = await AsyncStorage.getItem(DEVICES_KEY);
  return raw ? JSON.parse(raw) : [];
};

export const cacheMaintenance = async (data: any) => AsyncStorage.setItem(SCHED_KEY, JSON.stringify(data));
export const getCachedMaintenance = async () => {
  const raw = await AsyncStorage.getItem(SCHED_KEY);
  return raw ? JSON.parse(raw) : [];
};