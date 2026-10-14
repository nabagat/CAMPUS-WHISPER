import { firebaseStore } from './firebaseStore.js';

export const connectDB = async () => {
  try {
    await firebaseStore.init();
    console.log('✅ [FIREBASE_DB] Inbuilt Firebase/Firestore database engine connected successfully!');
    return firebaseStore;
  } catch (error) {
    console.error(`❌ [FIREBASE_DB] Database initialization failed: ${error.message}`);
    throw error;
  }
};

export const closeDB = async () => {
  try {
    await firebaseStore.saveToDisk();
    console.log('🔒 [FIREBASE_DB] Inbuilt Firebase database safely persisted and closed.');
  } catch (error) {
    console.error(`❌ [FIREBASE_DB] Error closing DB: ${error.message}`);
  }
};
