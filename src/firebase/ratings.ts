import { collection, addDoc, query, where, orderBy, getDocs, serverTimestamp, onSnapshot, QuerySnapshot } from 'firebase/firestore';
import { db } from './config';

type RatingRecord = { hostId: string; riderId?: string; rating: number; createdAt?: any };

export async function submitRatingFirestore(data: RatingRecord) {
  try {
    const col = collection(db, 'ratings');
    const docRef = await addDoc(col, { ...data, createdAt: serverTimestamp() });
    return { id: docRef.id };
  } catch (err) {
    console.warn('submitRatingFirestore error', err);
    throw err;
  }
}

export async function getHostRatingsFirestore(hostId: string) {
  try {
    const col = collection(db, 'ratings');
    const q = query(col, where('hostId', '==', hostId), orderBy('createdAt', 'asc'));
    const snap = await getDocs(q);
    const items: Array<{ id: string; rating: number; createdAt?: any }> = [];
    snap.forEach((d) => {
      const data = d.data() as any;
      let createdAt: any = data.createdAt;
      if (createdAt && typeof createdAt.toDate === 'function') createdAt = createdAt.toDate();
      items.push({ id: d.id, rating: data.rating, createdAt });
    });
    return items;
  } catch (err) {
    console.warn('getHostRatingsFirestore error', err);
    return [];
  }
}

export async function getHostStatsFirestore(hostId: string) {
  const items = await getHostRatingsFirestore(hostId);
  const count = items.length;
  const avg = count ? items.reduce((s, it) => s + (it.rating || 0), 0) / count : 0;
  return { avg, count, items };
}

export function subscribeHostRatings(hostId: string, onUpdate: (items: Array<{ id: string; rating: number; createdAt?: any }>) => void) {
  const col = collection(db, 'ratings');
  const q = query(col, where('hostId', '==', hostId), orderBy('createdAt', 'asc'));
  const unsub = onSnapshot(q, (snap: QuerySnapshot) => {
    const items: Array<{ id: string; rating: number; createdAt?: any }> = [];
    snap.forEach((d) => {
      const data = d.data() as any;
      let createdAt: any = data.createdAt;
      if (createdAt && typeof createdAt.toDate === 'function') createdAt = createdAt.toDate();
      items.push({ id: d.id, rating: data.rating, createdAt });
    });
    onUpdate(items);
  }, (err) => {
    console.warn('subscribeHostRatings error', err);
  });
  return unsub;
}
