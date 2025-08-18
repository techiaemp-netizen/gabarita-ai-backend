/**
 * Firestore helper functions
 *
 * This module provides simple abstractions around common Firestore
 * queries. In a real application these functions would encapsulate
 * logic to read and write user performance data, rankings, etc. For
 * demonstration purposes they return static or example data.
 */
import { collection, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '../config/firebase';

/**
 * Returns all performance documents for a given user. Each document
 * should contain at least a `tema` field for the subject and a
 * `valor` field representing the percentage of correct answers.
 *
 * @param {string} userId The currently signed in user's UID
 */
export async function getUserPerformance(userId) {
  const q = query(collection(firestore, 'performances'), where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map((doc) => doc.data());
}

/**
 * Example function returning a static ranking. This would normally
 * retrieve ranking documents from Firestore but is stubbed here
 * because the Firestore instance is not populated in this template.
 */
export async function getRanking() {
  return [
    { name: 'João', cargo: 'Analista', block: 'A', score: 95 },
    { name: 'Maria', cargo: 'Analista', block: 'B', score: 92 },
    { name: 'Carlos', cargo: 'Técnico', block: 'A', score: 88 },
  ];
}
