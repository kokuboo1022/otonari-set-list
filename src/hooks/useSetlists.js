import { useState, useEffect } from 'react';
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, query, orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';

export function useSetlists() {
  const [setlists, setSetlists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'setlists'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => {
      setSetlists(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, []);

  const createSetlist = async ({ name, date = '', venue = '' }) => {
    const ref = await addDoc(collection(db, 'setlists'), {
      name,
      date,
      venue,
      songIds: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  };

  const updateSetlist = (id, data) =>
    updateDoc(doc(db, 'setlists', id), { ...data, updatedAt: serverTimestamp() });

  const deleteSetlist = id => deleteDoc(doc(db, 'setlists', id));

  return { setlists, loading, createSetlist, updateSetlist, deleteSetlist };
}
