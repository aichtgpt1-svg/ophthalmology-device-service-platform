import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import API from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');

  const login = async () => {
    try {
      const { data } = await API.post('/auth/login', { email, password: pwd });
      await AsyncStorage.setItem('token', data.token);
      navigation.replace('Dashboard');
    } catch (e: any) {
      Alert.alert('Login failed', e.response?.data?.message || 'Error');
    }
  };

  return (
    <View style={{ padding: 20, marginTop: 100 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>ODSP Mobile</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={{ borderBottomWidth: 1, marginBottom: 12 }} />
      <TextInput placeholder="Password" value={pwd} onChangeText={setPwd} secureTextEntry style={{ borderBottomWidth: 1, marginBottom: 20 }} />
      <Button title="Login" onPress={login} />
    </View>
  );
}