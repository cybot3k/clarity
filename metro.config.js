const dns = require('dns');

// Windows resolves `localhost` to ::1, and Node then listens on that IPv6
// address only. `expo start --localhost` binds that way, while Expo Go on
// Android (and `adb reverse`) connects to IPv4 127.0.0.1. The manifest
// request never reaches Metro, and Expo Go reports
// "Uncaught Error: java.io.IOException: Failed to download remote update".
if (process.platform === 'win32' && typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { FileStore } = require('metro-cache');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Web font faces are woff2. Metro's default asset list does not include them,
// so the web bundle cannot resolve constants/font-assets.web.ts.
if (!config.resolver.assetExts.includes('woff2')) {
  config.resolver.assetExts.push('woff2');
}

// Move Metro's cache out of Windows %TEMP%.
// This avoids the EMFILE errors happening in %TEMP%\metro-cache.
config.cacheStores = [
  new FileStore({
    root: path.join(__dirname, 'node_modules', '.cache', 'metro'),
  }),
];

console.log('🔥 METRO CACHE STORES:', config.cacheStores);
module.exports = config;