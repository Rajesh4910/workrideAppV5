import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
  onSnapshot,
  QuerySnapshot,
} from 'firebase/firestore';
import { db } from './config';

export async function sendMessage(threadId: string, payload: { from: string; text: string }) {
  try {
    const col = collection(db, 'messages');
    const docRef = await addDoc(col, { threadId, from: payload.from, text: payload.text, createdAt: serverTimestamp(), status: 'sent' });
    return { id: docRef.id };
  } catch (err) {
    console.warn('sendMessage error', err);
    throw err;
  }
}

export async function getThreadMessages(threadId: string) {
  try {
    const col = collection(db, 'messages');
    const q = query(col, where('threadId', '==', threadId), orderBy('createdAt', 'asc'));
    const snap = await getDocs(q);
    const items: Array<{ id: string; from: string; text: string; createdAt?: any; status?: string }> = [];
    snap.forEach((d) => {
      const data = d.data() as any;
      let createdAt: any = data.createdAt;
      if (createdAt && typeof createdAt.toDate === 'function') createdAt = createdAt.toDate();
      items.push({ id: d.id, from: data.from, text: data.text, createdAt, status: data.status });
    });
    return items;
  } catch (err) {
    console.warn('getThreadMessages error', err);
    return [];
  }
}

export function subscribeThreadMessages(threadId: string, onUpdate: (items: Array<{ id: string; from: string; text: string; createdAt?: any }>) => void) {
  const col = collection(db, 'messages');
  const q = query(col, where('threadId', '==', threadId), orderBy('createdAt', 'asc'));
  const unsub = onSnapshot(q, (snap: QuerySnapshot) => {
    const items: Array<{ id: string; from: string; text: string; createdAt?: any; status?: string }> = [];
    snap.forEach((d) => {
      const data = d.data() as any;
      let createdAt: any = data.createdAt;
      if (createdAt && typeof createdAt.toDate === 'function') createdAt = createdAt.toDate();
      items.push({ id: d.id, from: data.from, text: data.text, createdAt, status: data.status });
    });
    onUpdate(items);
  }, (err) => console.warn('subscribeThreadMessages error', err));
  return unsub;
}

export async function updateMessageStatus(messageId: string, status: 'sent' | 'delivered' | 'read') {
  try {
    const { doc, updateDoc } = await import('firebase/firestore');
    const ref = doc(db, 'messages', messageId);
    await updateDoc(ref, { status });
  } catch (err) {
    console.warn('updateMessageStatus error', err);
  }
}

// Typing indicator helpers: write a small doc per thread+user
export async function setTyping(threadId: string, userId: string, isTyping: boolean) {
  try {
    const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
    const ref = doc(db, 'threadTyping', `${threadId}_${userId}`);
    await setDoc(ref, { threadId, userId, isTyping, updatedAt: serverTimestamp() });
  } catch (err) {
    console.warn('setTyping error', err);
  }
}

export function subscribeThreadTyping(threadId: string, onUpdate: (users: Array<{ userId: string; isTyping: boolean }>) => void) {
  const { collection, query, where, onSnapshot } = require('firebase/firestore');
  const col = collection(db, 'threadTyping');
  const q = query(col, where('threadId', '==', threadId));
  const unsub = onSnapshot(q, (snap: QuerySnapshot) => {
    const users: Array<{ userId: string; isTyping: boolean }> = [];
    snap.forEach((d: any) => {
      const data = d.data();
      users.push({ userId: data.userId, isTyping: data.isTyping });
    });
    onUpdate(users);
  }, (err: any) => console.warn('subscribeThreadTyping error', err));
  return unsub;
}

export async function markThreadRead(threadId: string, userId: string) {
  try {
    const { collection, query, where, getDocs, doc, updateDoc } = await import('firebase/firestore');
    const col = collection(db, 'messages');
    const q = query(col, where('threadId', '==', threadId), where('from', '!=', userId));
    const snap = await getDocs(q);
    const updates: Array<Promise<any>> = [];
    snap.forEach((d) => {
      const data = d.data() as any;
      if (data.status !== 'read') {
        const ref = doc(db, 'messages', d.id);
        updates.push(updateDoc(ref, { status: 'read' }));
      }
    });
    await Promise.all(updates);
  } catch (err) {
    console.warn('markThreadRead error', err);
  }
}
