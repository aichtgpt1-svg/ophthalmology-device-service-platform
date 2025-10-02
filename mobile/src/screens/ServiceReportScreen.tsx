import React, { useState } from 'react';
import { View, Text, Button, TextInput } from 'react-native';
import Voice from 'react-native-voice';

export default function ServiceReportScreen() {
  const [result, setResult] = useState('');
  const [recording, setRecording] = useState(false);

  const start = async () => {
    setRecording(true);
    setResult('');
    try { await Voice.start('en-US'); } catch (e) { console.error(e); }
  };

  const stop = async () => {
    setRecording(false);
    try { await Voice.stop(); } catch (e) { console.error(e); }
  };

  Voice.onSpeechResults = (e: any) => setResult(e.value?.[0] || '');

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 12 }}>Voice Service Report</Text>
      <Button title={recording ? 'Stop Recording' : 'Start Recording'} onPress={recording ? stop : start} />
      <TextInput
        multiline
        style={{ borderWidth: 1, marginTop: 12, minHeight: 120, padding: 8 }}
        value={result}
        onChangeText={setResult}
        placeholder="Spoken text appears here…"
      />
      <Button title="Save Report" onPress={() => alert('Saved: ' + result)} />
    </View>
  );
}