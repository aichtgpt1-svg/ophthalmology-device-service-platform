import React, { useState } from 'react';
import { View, Text, Button, Image } from 'react-native';
import { launchCamera } from 'react-native-image-picker';

export default function PhotoReportScreen() {
  const [uri, setUri] = useState<string | null>(null);

  const takePhoto = () => {
    launchCamera({ mediaType: 'photo', quality: 0.7 }, (res) => {
      if (res.assets && res.assets[0]) setUri(res.assets[0].uri!);
    });
  };

  return (
    <View style={{ flex: 1, padding: 16, alignItems: 'center' }}>
      <Text style={{ fontSize: 18, marginBottom: 12 }}>Photo Service Report</Text>
      <Button title="Take Photo" onPress={takePhoto} />
      {uri && <Image source={{ uri }} style={{ width: 300, height: 300, marginTop: 12 }} />}
    </View>
  );
}