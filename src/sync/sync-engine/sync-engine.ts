// src/sync/sync-engine.ts
import { authClient } from "@/lib/auth/auth-client";
import { syncQueueRepository } from "../queue/sync-queue.repository";
import { SyncQueueRow } from "@/db/client/schema/sync-queue-schema";
import { clientEnv } from "@/env/client";

const BASE_URL = clientEnv.EXPO_PUBLIC_API_URL;

export const syncEngine = {
  // 'isSyncing' ek memory-lock (taala) hai taaki jab multiple events (app launch, net connect, new workout) ek saath sync() ko call karein, toh ek baar mein sirf EK hi worker run ho aur data duplicate ya corrupt na ho.

  // Concurrency lock: do worker ek sath run na ho sakein
  isSyncing: false,

  /**
   * Main Worker Function
   * Isko aap network connect hone par, app launch par, ya local mutation ke baad call karenge.
   */
  async sync(): Promise<{ processed: number; errors: number }> {
    if (this.isSyncing) {
      return { processed: 0, errors: 0 };
    }

    this.isSyncing = true;
    let processed = 0;
    let errors = 0;

    try {
      // 1. Session verify karein (Agar user logged out hai toh sync pause)
      const session = await authClient.getSession();
      const userId = session?.data?.user?.id;

      if (!userId) {
        return { processed: 0, errors: 0 };
      }

      await syncQueueRepository.recoverStaleProcessing(userId);

      // 2. Loop tab tak chalayein jab tak pending items khatam na ho jayein
      while (true) {
        // Ek batch fetch karein (FIFO order me)
        const batch = await syncQueueRepository.getNextPendingBatch(userId, 10);

        if (batch.length === 0) {
          break; // Queue khali hai ya koi item abhi retry backoff me wait kar raha hai
        }

        for (const item of batch) {
          // 3. Mark as processing (Lock this row)
          await syncQueueRepository.markProcessing(item.id);

          try {
            // 4. API ko dispatch karein
            await this.dispatchItem(item);

            // 5. Success -> Delete from queue
            await syncQueueRepository.markCompleted(item.id);
            processed++;
          } catch (error) {
            errors++;
            const errorMessage =
              error instanceof Error ? error.message : "Sync request failed";

            // 6. Failure -> Mark failed and calculate exponential backoff
            try {
              await syncQueueRepository.markFailed(item, errorMessage);
            } catch (queueError) {
              console.warn("[SYNC_QUEUE_UPDATE_ERROR]", queueError);
            }

            // Continue independent mutations; this row has its own retry schedule.
          }
        }
      }
    } catch (error) {
      errors++;
      console.warn("[SYNC_ENGINE_ERROR]", error);
    } finally {
      // Lock release
      this.isSyncing = false;
    }

    return { processed, errors };
  },

  /**
   * Dispatcher: Entity aur Operation ke hisab se sahi API endpoint hit karta hai
   */
  async dispatchItem(item: SyncQueueRow): Promise<void> {
    let payload: Record<string, unknown>;

    try {
      const parsed = JSON.parse(item.payload);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("Sync payload must be an object");
      }
      payload = parsed as Record<string, unknown>;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid JSON";
      throw new Error(
        `Invalid payload for ${item.entity}/${item.id}: ${message}`,
      );
    }

    switch (item.entity) {
      case "profile":
        return await this.syncProfile(item.operation, item.entityId, payload);

      case "workout":
      case "workout_set":
      case "exercise":
        throw new Error(
          `Sync handler for entity [${item.entity}] is not implemented`,
        );

      default:
        throw new Error(`Unknown entity in sync queue: ${item.entity}`);
    }
  },

  /**
   * Entity Handler: Profile Sync
   */
  async syncProfile(
    operation: string,
    entityId: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    if (operation === "create" || operation === "update") {
      const response = await authClient.$fetch(
        `${BASE_URL}/api/profile/onboarding`,
        {
          method: "POST",
          body: { ...payload, id: entityId },
        },
      );

      if (response.error) {
        throw new Error(
          `Profile sync failed with status ${response.error.status}: ${response.error.message}`,
        );
      }
      return;
    }

    throw new Error(`Unsupported operation [${operation}] for Profile.`);
  },
};
