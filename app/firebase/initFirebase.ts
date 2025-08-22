import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const requestFirebaseToken = async (): Promise<string | null> => {
  if (typeof window === "undefined") return null; // 서버에서는 실행 안함

  const { getMessaging, getToken } = await import("firebase/messaging");
  const messaging = getMessaging(app);

  try {
    const currentToken = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });
    return currentToken || null;
  } catch (err) {
    console.error("FCM 토큰 요청 실패:", err);
    return null;
  }
};

export const onFirebaseMessage = (callback: (payload: any) => void): void => {
  if (typeof window === "undefined") return;

  import("firebase/messaging").then(({ getMessaging, onMessage }) => {
    const messaging = getMessaging(app);
    onMessage(messaging, (payload) => {
      console.log("FCM 메시지 수신:", payload);
      callback(payload);

      const { title, body } = payload.notification || {};
      if (title && body) {
        new Notification(title, { body, icon: "/chat-icon.png" });
      }
    });
  });
};
