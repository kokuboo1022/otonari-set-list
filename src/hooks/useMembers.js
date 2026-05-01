import { useState, useEffect } from 'react';
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc,
  doc, query, orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';

export function useMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'members'), orderBy('order'));
    return onSnapshot(q, snap => {
      setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, []);

  const addMember = data =>
    addDoc(collection(db, 'members'), {
      name: data.name,
      instruments: data.instruments || [],
      mainInstrument: data.mainInstrument || '',
      photoURL: data.photoURL || '',
      order: data.order ?? members.length,
    });

  const updateMember = (id, data) => updateDoc(doc(db, 'members', id), data);
  const deleteMember = id => deleteDoc(doc(db, 'members', id));

  return { members, loading, addMember, updateMember, deleteMember };
}
