import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDocFromServer, enableIndexedDbPersistence } from "firebase/firestore";
import firebaseConfig from "@/firebase-applet-config.json";

console.log("Firebase initialized.");
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const dbId = (firebaseConfig as any).firestoreDatabaseId || "(default)";
export const db = getFirestore(app, dbId);

// Enable persistence for better offline behavior
if (typeof window !== "undefined") {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn("Multiple tabs open, persistence can only be enabled in one tab at a time.");
    } else if (err.code === 'unimplemented') {
      console.warn("The current browser does not support all of the features required to enable persistence.");
    }
  });
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const isOffline = !navigator.onLine || (error as any)?.code === 'unavailable' || (error as any)?.message?.includes('offline');
  
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  
  if (isOffline) {
    console.warn("AgroConnect is limited: You are currently offline. Some features may be unavailable.");
    // We don't necessarily want to throw and crash the app if we are offline for a non-critical read
    if (operationType === OperationType.LIST || operationType === OperationType.GET) {
       return; // Silently handle if it's a non-critical read
    }
  }

  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(isOffline ? "You appear to be offline. Please check your connection." : JSON.stringify(errInfo));
}

