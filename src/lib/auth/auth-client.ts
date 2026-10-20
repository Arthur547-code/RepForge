// src\lib\auth\auth-client.ts

import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { clientEnv } from "@/env/client";

export const authClient = createAuthClient({
    baseURL: clientEnv.EXPO_PUBLIC_API_URL, // Base URL of your Better Auth backend.
    plugins: [
        expoClient({
            scheme: "repforge",
            storagePrefix: "repforge",
            storage: SecureStore,
        })
    ]
});