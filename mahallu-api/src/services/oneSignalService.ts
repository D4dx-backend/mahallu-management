import axios from 'axios';

interface SendPushOptions {
  title: string;
  message: string;
  imageUrl?: string;
  playerIds?: string[];
}

export async function sendPushNotification({
  title,
  message,
  imageUrl,
  playerIds,
}: SendPushOptions): Promise<void> {
  const appId = process.env.ONESIGNAL_APP_ID;
  const apiKey = process.env.ONESIGNAL_REST_API_KEY;

  if (!appId || !apiKey) {
    console.warn('[OneSignal] Missing credentials, skipping push notification');
    return;
  }

  const payload: Record<string, any> = {
    app_id: appId,
    headings: { en: title },
    contents: { en: message },
  };

  if (playerIds && playerIds.length > 0) {
    payload.include_player_ids = playerIds;
  } else {
    payload.included_segments = ['Subscribed Users'];
  }

  if (imageUrl) {
    payload.chrome_web_image = imageUrl;
    payload.big_picture = imageUrl;
    payload.ios_attachments = { id1: imageUrl };
  }

  await axios.post('https://onesignal.com/api/v1/notifications', payload, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${apiKey}`,
    },
  });
}

export function sendPushSilent(options: SendPushOptions): void {
  sendPushNotification(options).catch((err) => {
    console.error('[OneSignal] Push failed:', err?.response?.data || err.message);
  });
}
