import { useState, useEffect, useCallback } from 'react';

const VAPID_PUBLIC_KEY = 'BEl62iSMg_V_L7JIVulnF6zFmMFBF6mRRb5bO2CDBFznr-lwR7B4SrUAYN9Bzqpm5PKZdTklyY0H5jVr5ZUmDw';

export function usePushNotification() {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
    setSupported(isSupported);
    if (isSupported) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!supported) return false;
    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  }, [supported]);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!supported || permission !== 'granted') return false;
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      // In production, send subscription to server
      console.log('Push subscription:', subscription.toJSON());
      setSubscribed(true);
      return true;
    } catch (err) {
      console.error('Push subscription failed:', err);
      return false;
    }
  }, [supported, permission]);

  const showNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (permission === 'granted') {
      new Notification(title, {
        icon: '/images/c-mascot.png',
        badge: '/images/c-mascot.png',
        ...options,
      });
    }
  }, [permission]);

  return { supported, permission, subscribed, requestPermission, subscribe, showNotification };
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}
