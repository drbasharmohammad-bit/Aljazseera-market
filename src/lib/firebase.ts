import { initializeApp, getApps } from 'firebase/app';
import { 
  initializeFirestore,
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  doc, 
  serverTimestamp, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  writeBatch 
} from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyAzPcdVl7LOFIC1tHictJowcPkemP3uL6c",
  authDomain: "al-jazeera-market.firebaseapp.com",
  projectId: "al-jazeera-market",
  storageBucket: "al-jazeera-market.firebasestorage.app",
  messagingSenderId: "230330686123",
  appId: "1:230330686123:web:a097b24d748aa8edc375ee",
  measurementId: "G-PYD6J8NNBS"
};

export const app = (() => {
  try {
    const existing = getApps();
    if (existing && existing.length > 0) {
      return existing[0];
    }
  } catch {
    // fallback
  }
  return initializeApp(firebaseConfig);
})();

// تهيئة Firestore مع تفعيل experimentalForceLongPolling لتجاوز حظر الـ WebSockets في الـ Iframe والـ Sandbox
export const db = (() => {
  try {
    return initializeFirestore(app, {
      experimentalForceLongPolling: true
    });
  } catch {
    return getFirestore(app);
  }
})();

// دالة تنظيف البيانات لمنع أخطاء الحقول الفارغة (undefined)
export function sanitizeFirestorePayload<T extends Record<string, any>>(obj: T): Partial<T> {
  if (!obj || typeof obj !== 'object') return obj;
  const clean: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (
        value !== null && 
        typeof value === 'object' && 
        !Array.isArray(value) && 
        !(value instanceof Date) && 
        typeof (value as any).toDate !== 'function' &&
        !(value as any)._methodName
      ) {
        clean[key] = sanitizeFirestorePayload(value);
      } else {
        clean[key] = value;
      }
    }
  }
  return clean as Partial<T>;
}

export { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  doc, 
  serverTimestamp, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  writeBatch 
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
  };
  console.warn('Firestore Warning/Error: ', JSON.stringify(errInfo));
  return errInfo;
}
