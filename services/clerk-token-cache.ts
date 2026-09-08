/**
 * Clerk session JWT cache. The stock `@clerk/expo/token-cache` deletes the
 * token whenever SecureStore throws on read, which on Android Expo Go (keystore
 * blip, Expo Go update) looks like a logout. We never delete on a failed read.
 */

import * as SecureStore from 'expo-secure-store';

const opts = { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK };

export const tokenCache = {
  async getToken(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key, opts);
    } catch (error) {
      console.warn('[clerk-token-cache] getToken failed', error);
      return null;
    }
  },
  async saveToken(key: string, token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, token, opts);
    } catch (error) {
      console.warn('[clerk-token-cache] saveToken failed', error);
    }
  },
  async clearToken(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key, opts);
    } catch (error) {
      console.warn('[clerk-token-cache] clearToken failed', error);
    }
  },
};
