const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { FileStore } = require('metro-cache');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Move Metro's cache out of Windows %TEMP%.
// This avoids the EMFILE errors happening in %TEMP%\metro-cache.
config.cacheStores = [
  new FileStore({
    root: path.join(__dirname, 'node_modules', '.cache', 'metro'),
  }),
];

console.log('🔥 METRO CACHE STORES:', config.cacheStores);
module.exports = config;