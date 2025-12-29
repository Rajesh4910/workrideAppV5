import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { Platform } from 'react-native';

// Firebase config — filled from your Android `google-services.json` where possible.
// Note: please add a Web app in the Firebase Console and paste its `appId` if you plan
// to use the Firebase Web SDK fully. The Android `mobilesdk_app_id` is used here as
// a temporary fallback.
const firebaseConfig = {
  apiKey: 'AIzaSyA1dlrnOFkIr9-AA7LKbc275Fx_Yz2uJ_c',
  authDomain: 'workride-4a320.firebaseapp.com',
  projectId: 'workride-4a320',
  storageBucket: 'workride-4a320.firebasestorage.app',
  messagingSenderId: '617231655026',
  appId: '1:617231655026:web:207c460b0147d8b15ba2eb',
  measurementId: 'G-543W0PFFS8',
};

let firebaseApp: any;
if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApps()[0];
}

const db = getFirestore(firebaseApp);

// If you want to use the local Firestore emulator during development,
// set FIRESTORE_EMULATOR_HOST environment variable to e.g. '127.0.0.1:8080'
if (__DEV__ && process.env.FIRESTORE_EMULATOR_HOST) {
  // Try to auto-detect a reachable local emulator host so the app
  // reliably uses the emulator on different dev setups.
  (async () => {
    const tryHosts = [] as string[];
    if (process.env.FIRESTORE_EMULATOR_HOST) tryHosts.push(process.env.FIRESTORE_EMULATOR_HOST);
    // On Android emulator host machine is 10.0.2.2
    if (Platform.OS === 'android') tryHosts.push('10.0.2.2:8080');
    // Localhost fallback (iOS simulator or when using reverse)
    tryHosts.push('127.0.0.1:8080');

    for (const raw of tryHosts) {
      if (!raw) continue;
      const [host, portStr] = raw.split(':');
      const port = Number(portStr || '8080');
      try {
        // quick availability check
        const res = await fetch(`http://${host}:${port}/` , { method: 'GET' });
        if (res.ok || res.status === 400 || res.status === 404) {
          console.log('Connecting Firestore emulator at', host + ':' + port);
          connectFirestoreEmulator(db, host, port);
          return;
        }
      } catch (e) {
        // try next host
      }
    }
    console.warn('No reachable Firestore emulator detected; falling back to production Firestore.');
  })();
}

export { firebaseApp, db };
