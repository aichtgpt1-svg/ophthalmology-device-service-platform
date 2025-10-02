import PushNotification from 'react-native-push-notification';

export const initPush = () => {
  PushNotification.createChannel(
    { channelId: 'maintenance', channelName: 'Maintenance Alerts', importance: 4, vibrate: true },
    () => {}
  );
};

export const showLocal = (title: string, message: string) => {
  PushNotification.localNotification({
    channelId: 'maintenance',
    title,
    message,
    playSound: true,
    soundName: 'default',
    importance: 'high',
  });
};