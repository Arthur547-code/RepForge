// src/sync/network-listener.ts
import NetInfo from "@react-native-community/netinfo";
import { syncEngine } from "./sync-engine/sync-engine";

export function initNetworkSyncListener() {
  return NetInfo.addEventListener((state) => {
    if (state.isConnected && state.isInternetReachable !== false) {
      syncEngine.sync().catch((err) => {
        console.warn("Network reconnect sync error:", err);
      });
    }
  });
}
