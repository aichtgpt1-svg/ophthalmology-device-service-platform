import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import API from '../services/api';

export default function DueBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const poll = () => API.get('/maintenance/due').then(r => setCount(r.data.length)).catch(() => {});
    poll();
    const id = setInterval(poll, 30000);
    return () => clearInterval(id);
  }, []);

  if (!count) return null;
  return (
    <View style={{ backgroundColor: '#e00', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2, marginLeft: 6 }}>
      <Text style={{ color: '#fff', fontSize: 12 }}>{count}</Text>
    </View>
  );
}