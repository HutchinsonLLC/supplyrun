import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';

export type ListItem = {
  id: string;
  title: string;
  createdAt: number | null;
};

export const listenToLists = (userId: string, onListsChange: (lists: ListItem[]) => void) => {
  const listsRef = collection(db, 'users', userId, 'lists');
  const listQuery = query(listsRef, orderBy('createdAt', 'desc'));

  return onSnapshot(listQuery, (snapshot) => {
    const lists = snapshot.docs.map((doc) => {
      const data = doc.data();
      const timestamp = data.createdAt as Timestamp | undefined;

      return {
        id: doc.id,
        title: String(data.title ?? ''),
        createdAt: timestamp ? timestamp.toMillis() : null,
      };
    });

    onListsChange(lists);
  });
};

export const addList = async (userId: string, title: string) => {
  const listsRef = collection(db, 'users', userId, 'lists');
  await addDoc(listsRef, {
    title,
    createdAt: serverTimestamp(),
  });
};
