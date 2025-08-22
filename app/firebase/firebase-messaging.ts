declare module 'firebase/messaging' {
    import { FirebaseApp } from 'firebase/app';
  
    export function getMessaging(app?: FirebaseApp): any;
    export function getToken(messaging: any, options?: any): Promise<string | null>;
    export function onMessage(messaging: any, callback: (payload: any) => void): void;
  }
  