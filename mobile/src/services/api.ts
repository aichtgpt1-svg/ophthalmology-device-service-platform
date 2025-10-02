import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API = axios.create({
  baseURL: 'http://192.168.1.16:4000/api',   // ← find your LAN IP
  withCredentials: true,
});

// attach token
API.interceptors.request.use(async (cfg) => {
  const tok = await AsyncStorage.getItem('token');
  if (tok) cfg.headers.Authorization = `Bearer ${tok}`;
  return cfg;
});

// auto logout on 401
API.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      // navigate to login outside this file
    }
    return Promise.reject(err);
  }
);

export default API;