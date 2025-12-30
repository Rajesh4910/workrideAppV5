import { collection, doc, setDoc, updateDoc, onSnapshot, getDoc, getDocs, query, where, deleteField } from 'firebase/firestore';
import { db } from './config';

export type RideDoc = {
  id: string;
  status?: 'PENDING' | 'ACCEPTED' | 'ONGOING' | 'COMPLETED';
  hostId?: string;
  riderId?: string;
  hostLocation?: { lat: number; lng: number; updatedAt: any };
  createdAt?: any;
};

const ridesCol = collection(db, 'rides');

export async function createOrUpdateRide(rideId: string, data: Partial<RideDoc>) {
  const ref = doc(ridesCol, rideId);
  await setDoc(ref, { ...data, id: rideId }, { merge: true });
}

export async function updateHostLocation(rideId: string, lat: number, lng: number) {
  const ref = doc(ridesCol, rideId);
  await updateDoc(ref, { hostLocation: { lat, lng, updatedAt: new Date() } }).catch(async (err) => {
    // fallback to set if doc doesn't exist
    await setDoc(ref, { hostLocation: { lat, lng, updatedAt: new Date() }, id: rideId }, { merge: true });
  });
}

export async function listAvailableRides() {
  try {
    const q = query(ridesCol, where('status', '==', 'ACCEPTED'));
    const snaps = await getDocs(q);
    return snaps.docs.map((d) => ({ ...(d.data() as RideDoc), id: d.id }));
  } catch (err) {
    console.warn('listAvailableRides failed', err);
    return [] as RideDoc[];
  }
}

export async function submitRideRequest(
  rideId: string,
  riderId: string,
  pickup: { lat: number; lng: number; name: string },
  riderName?: string
) {
  const ref = doc(ridesCol, rideId);
  const payload = { pendingRequest: { riderId, riderName: riderName || null, pickup, createdAt: new Date() } };
  try {
    await updateDoc(ref, payload);
  } catch (err) {
    // if update failed (doc missing), create/merge the doc with the request
    await setDoc(ref, { ...payload, id: rideId }, { merge: true });
  }
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function listAvailableRidesNearby(pickup: { lat: number; lng: number }, maxKm = 5) {
  try {
    const all = await listAvailableRides();
    // filter rides that have hostLocation
    return all.filter((r) => {
      const loc = (r as any).hostLocation;
      if (!loc || typeof loc.lat !== 'number' || typeof loc.lng !== 'number') return false;
      const dist = haversineKm(pickup.lat, pickup.lng, loc.lat, loc.lng);
      return dist <= maxKm;
    });
  } catch (err) {
    console.warn('listAvailableRidesNearby failed', err);
    return [] as RideDoc[];
  }
}

export async function listPendingRequests(hostId: string) {
  try {
    const q = query(ridesCol, where('hostId', '==', hostId));
    const snaps = await getDocs(q);
    const results: Array<{ rideId: string; pendingRequest?: any }> = [];
    snaps.docs.forEach((d) => {
      const data = d.data() as any;
      if (data.pendingRequest) results.push({ rideId: d.id, pendingRequest: data.pendingRequest });
    });
    return results;
  } catch (err) {
    console.warn('listPendingRequests failed', err);
    return [] as any[];
  }
}

export async function acceptPendingRequest(rideId: string) {
  const ref = doc(ridesCol, rideId);
  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) return false;
    const data: any = snap.data();
    const pending = data.pendingRequest;
    if (!pending) return false;
    await updateDoc(ref, { acceptedRequest: pending, pendingRequest: deleteField(), status: 'ACCEPTED' });
    return true;
  } catch (err) {
    console.warn('acceptPendingRequest failed', err);
    return false;
  }
}

export async function declinePendingRequest(rideId: string) {
  const ref = doc(ridesCol, rideId);
  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) return false;
    const data: any = snap.data();
    const pending = data.pendingRequest;
    if (!pending) return false;
    // move to declinedRequests array (append) and remove pending
    const declined = data.declinedRequests || [];
    declined.push(pending);
    await updateDoc(ref, { declinedRequests: declined, pendingRequest: deleteField() });
    return true;
  } catch (err) {
    console.warn('declinePendingRequest failed', err);
    return false;
  }
}

export function subscribeRide(rideId: string, cb: (data: RideDoc | null) => void) {
  const ref = doc(ridesCol, rideId);
  const unsub = onSnapshot(ref, (snap) => {
    if (!snap.exists()) return cb(null);
    cb(snap.data() as RideDoc);
  });
  return unsub;
}

export async function getRide(rideId: string) {
  const ref = doc(ridesCol, rideId);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as RideDoc) : null;
}
