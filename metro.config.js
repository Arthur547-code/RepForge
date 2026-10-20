// 1. Get the base Expo configuration
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname, { isCSSEnabled: true });

// 2. Apply all mutations directly to the config object FIRST
config.resolver.sourceExts.push("sql");

// CRITICAL FOR BETTER AUTH: Force package exports resolution 
config.resolver.unstable_enablePackageExports = true; 

// 3. Export by wrapping your fully modified config in NativeWind
module.exports = withNativeWind(config, { input: './src/global.css' });
