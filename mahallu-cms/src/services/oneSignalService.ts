declare global {
  interface Window {
    OneSignalDeferred: Array<(OneSignal: any) => void | Promise<void>>;
  }
}

let initialized = false;

export async function initAndSubscribe(): Promise<string | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const appId = (import.meta as any).env?.VITE_ONESIGNAL_APP_ID as string | undefined;
  if (!appId || typeof window === 'undefined') return null;

  return new Promise<string | null>((resolve) => {
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async (OneSignal: any) => {
      try {
        if (!initialized) {
          await OneSignal.init({
            appId,
            allowLocalhostAsSecureOrigin: true,
            serviceWorkerParam: { scope: '/' },
          });
          initialized = true;
        }

        const granted = await OneSignal.Notifications.requestPermission();
        if (!granted) {
          resolve(null);
          return;
        }

        // Wait briefly for the subscription ID to become available
        await new Promise((r) => setTimeout(r, 1500));
        const id: string | null = OneSignal.User?.PushSubscription?.id ?? null;
        resolve(id);
      } catch {
        resolve(null);
      }
    });
  });
}
