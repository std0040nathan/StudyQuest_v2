import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  Unsubscribe,
} from 'firebase/firestore';
import { UserAccount, Quest, UserStats, AppSettings } from '../types';
import firebaseConfigJson from '../../firebase-applet-config.json';

// Firebase configuration
const firebaseConfig = {
  projectId: firebaseConfigJson.projectId || 'api-is-the-key-to-my-heart',
  appId: firebaseConfigJson.appId || '1:74191870998:web:bfe7314b460b4d74baa937',
  apiKey: firebaseConfigJson.apiKey || 'AIzaSyC_ZisTDlRSfEr-OzU1B8-g7AK1B1OJW6g',
  authDomain: firebaseConfigJson.authDomain || 'api-is-the-key-to-my-heart.firebaseapp.com',
  storageBucket: firebaseConfigJson.storageBucket || 'api-is-the-key-to-my-heart.firebasestorage.app',
  messagingSenderId: firebaseConfigJson.messagingSenderId || '74191870998',
};

const databaseId = firebaseConfigJson.firestoreDatabaseId || '(default)';

// Initialize Firebase App singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with specific database ID if configured
export const db = getFirestore(app, databaseId);

const ACCOUNTS_COLLECTION = 'accounts';

/**
 * Save or update complete account to Cloud Firestore
 */
export async function saveAccountToCloud(account: UserAccount): Promise<boolean> {
  try {
    const accountRef = doc(db, ACCOUNTS_COLLECTION, account.id);
    const dataToSave = {
      ...account,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(accountRef, dataToSave, { merge: true });
    return true;
  } catch (err) {
    console.debug('Cloud sync save info:', err);
    return false;
  }
}

/**
 * Fetch all available cloud accounts for device discovery
 */
export async function fetchAllCloudAccounts(): Promise<UserAccount[]> {
  try {
    const q = collection(db, ACCOUNTS_COLLECTION);
    const snapshot = await getDocs(q);
    const accounts: UserAccount[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as UserAccount;
      if (data && data.id && data.name) {
        accounts.push(data);
      }
    });
    return accounts;
  } catch (err) {
    console.debug('Could not fetch cloud accounts info:', err);
    return [];
  }
}

/**
 * Find account in cloud by email or username
 */
export async function findCloudAccountByEmailOrName(identifier: string): Promise<UserAccount | null> {
  const clean = identifier.trim().toLowerCase();
  if (!clean) return null;

  try {
    // 1. Direct ID lookup if identifier happens to be account ID
    const directDoc = await getDoc(doc(db, ACCOUNTS_COLLECTION, identifier));
    if (directDoc.exists()) {
      return directDoc.data() as UserAccount;
    }

    // 2. Query by email
    const accountsRef = collection(db, ACCOUNTS_COLLECTION);
    const emailQuery = query(accountsRef, where('email', '==', identifier.trim()));
    const emailSnap = await getDocs(emailQuery);
    if (!emailSnap.empty) {
      return emailSnap.docs[0].data() as UserAccount;
    }

    // 3. Fallback scan all docs for case-insensitive email or name match
    const allSnap = await getDocs(accountsRef);
    for (const docSnap of allSnap.docs) {
      const data = docSnap.data() as UserAccount;
      if (
        data.email?.toLowerCase() === clean ||
        data.name?.toLowerCase() === clean
      ) {
        return data;
      }
    }

    return null;
  } catch (err) {
    console.debug('Cloud lookup info:', err);
    return null;
  }
}

/**
 * Real-time listener for active user account data
 */
export function subscribeToCloudAccount(
  accountId: string,
  onUpdate: (account: UserAccount) => void
): Unsubscribe {
  const accountRef = doc(db, ACCOUNTS_COLLECTION, accountId);
  return onSnapshot(
    accountRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as UserAccount;
        onUpdate(data);
      }
    },
    (error) => {
      console.debug('Cloud subscription listener info:', error);
    }
  );
}

/**
 * Update quests in Cloud Firestore
 */
export async function updateQuestsInCloud(accountId: string, quests: Quest[]): Promise<boolean> {
  try {
    const accountRef = doc(db, ACCOUNTS_COLLECTION, accountId);
    await setDoc(accountRef, { quests, updatedAt: new Date().toISOString() }, { merge: true });
    return true;
  } catch (err) {
    console.debug('Cloud quests update info:', err);
    return false;
  }
}

/**
 * Update stats in Cloud Firestore
 */
export async function updateStatsInCloud(accountId: string, stats: UserStats): Promise<boolean> {
  try {
    const accountRef = doc(db, ACCOUNTS_COLLECTION, accountId);
    await setDoc(accountRef, { stats, updatedAt: new Date().toISOString() }, { merge: true });
    return true;
  } catch (err) {
    console.debug('Cloud stats update info:', err);
    return false;
  }
}

/**
 * Update settings in Cloud Firestore
 */
export async function updateSettingsInCloud(
  accountId: string,
  settings: Partial<AppSettings>
): Promise<boolean> {
  try {
    const accountRef = doc(db, ACCOUNTS_COLLECTION, accountId);
    await setDoc(accountRef, { settings, updatedAt: new Date().toISOString() }, { merge: true });
    return true;
  } catch (err) {
    console.debug('Cloud settings update info:', err);
    return false;
  }
}

/**
 * Error handling helper conforming to Firestore skill guidelines
 */
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
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: false,
      isAnonymous: true,
      tenantId: null,
      providerInfo: [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

/**
 * Permanently delete account and all database records from Cloud Firestore.
 * Removes documents matching the account ID or email address so that
 * the user can register a new account with the same email.
 */
export async function deleteAccountFromCloud(accountId: string, email?: string): Promise<boolean> {
  const cleanEmail = email?.trim().toLowerCase();
  let deletedCount = 0;

  try {
    // 1. Delete by direct account ID if provided
    if (accountId) {
      try {
        const directDocRef = doc(db, ACCOUNTS_COLLECTION, accountId);
        await deleteDoc(directDocRef);
        deletedCount++;
      } catch (err) {
        console.debug('Error deleting account doc by ID:', err);
      }

      try {
        const userDocRef = doc(db, 'users', accountId);
        await deleteDoc(userDocRef);
      } catch (err) {
        // Ignored if users collection does not have this doc
      }
    }

    // 2. Query and delete all documents in 'accounts' matching the exact email
    if (email?.trim()) {
      try {
        const accountsRef = collection(db, ACCOUNTS_COLLECTION);
        const emailQuery = query(accountsRef, where('email', '==', email.trim()));
        const snap = await getDocs(emailQuery);
        for (const docSnap of snap.docs) {
          await deleteDoc(doc(db, ACCOUNTS_COLLECTION, docSnap.id));
          deletedCount++;
        }
      } catch (err) {
        console.debug('Error querying accounts by email for deletion:', err);
      }
    }

    // 3. Fallback scan all docs in 'accounts' to catch case-insensitive or name-matching documents
    try {
      const allAccountsSnap = await getDocs(collection(db, ACCOUNTS_COLLECTION));
      for (const docSnap of allAccountsSnap.docs) {
        const data = docSnap.data() as UserAccount;
        const matchesId = accountId && docSnap.id === accountId;
        const matchesEmail = cleanEmail && data.email && data.email.trim().toLowerCase() === cleanEmail;
        if (matchesId || matchesEmail) {
          await deleteDoc(doc(db, ACCOUNTS_COLLECTION, docSnap.id));
          deletedCount++;
        }
      }
    } catch (err) {
      console.debug('Error in broad scan accounts deletion:', err);
    }

    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${ACCOUNTS_COLLECTION}/${accountId}`);
    return deletedCount > 0;
  }
}

