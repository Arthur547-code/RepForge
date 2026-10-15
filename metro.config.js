const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname, { isCSSEnabled: true });
config.resolver.sourceExts.push("sql");

// metro.config.js
module.exports = withNativeWind(config, { input: './src/global.css' })

// Metro ko batao ki .sql files ko bhi bundle me include kare
config.resolver.sourceExts.push("sql");
