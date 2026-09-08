/**
 * Synchronous file-backed KvBackend for runtimes where MMKV is missing (Expo
 * Go). Same interface as MMKV, so history/settings/auth keep first-frame
 * snapshots. Writes dump the whole map to a JSON file in the document directory.
 */

import { File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

import { createMemoryKv, type KvBackend } from '@/lib/history-store';

const FILE_NAME = 'clarity-kv-v1.json';

function snapshot(memory: KvBackend): Record<string, string | number | boolean> {
  const dump: Record<string, string | number | boolean> = {};
  for (const key of memory.getAllKeys()) {
    const stringValue = memory.getString(key);
    if (stringValue !== undefined) {
      dump[key] = stringValue;
      continue;
    }
    const numberValue = memory.getNumber(key);
    if (numberValue !== undefined) {
      dump[key] = numberValue;
      continue;
    }
    const booleanValue = memory.getBoolean(key);
    if (booleanValue !== undefined) dump[key] = booleanValue;
  }
  return dump;
}

export function createFileKv(): KvBackend {
  if (Platform.OS === 'web') {
    throw new Error('file kv is native-only');
  }
  const file = new File(Paths.document, FILE_NAME);
  const initial: Record<string, string | number | boolean> = {};
  if (file.exists) {
    const parsed: unknown = JSON.parse(file.textSync());
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          initial[key] = value;
        }
      }
    }
  }

  const memory = createMemoryKv(initial);

  const persist = () => {
    try {
      if (!file.exists) file.create();
      file.write(JSON.stringify(snapshot(memory)));
    } catch (error) {
      console.warn('[storage] file kv persist failed', error);
    }
  };

  return {
    getString: memory.getString,
    getNumber: memory.getNumber,
    getBoolean: memory.getBoolean,
    set: (key, value) => {
      memory.set(key, value);
      persist();
    },
    remove: (key) => {
      const removed = memory.remove(key);
      persist();
      return removed;
    },
    contains: memory.contains,
    getAllKeys: memory.getAllKeys,
    clearAll: () => {
      memory.clearAll();
      persist();
    },
  };
}
