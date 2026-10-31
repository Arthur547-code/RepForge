// scripts/seed-server-exercises.ts
import { remoteDb } from "@/db/server";
import {
  exercises,
  NewServerExercise,
} from "@/db/server/schema/exercise-schema";
import crypto from "node:crypto";
import { z } from "zod";

export const EXERCISE_DATA_URL =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json";

export const EXERCISE_IMAGE_BASE_URL =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises";

/* -------------------------------------------------------------------------- */
/* Zod Validation Schema for External Dataset                                 */
/* -------------------------------------------------------------------------- */

const freeExerciseSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string().nullish(),
  force: z.string().nullish(),
  level: z.string().nullish(),
  mechanic: z.string().nullish(),
  equipment: z.string().nullish(),
  primaryMuscles: z.array(z.string()).nullish(),
  secondaryMuscles: z.array(z.string()).nullish(),
  instructions: z.array(z.string()).nullish(),
  images: z.array(z.string()).nullish(),
});

type RawExercise = z.infer<typeof freeExerciseSchema>;

/* -------------------------------------------------------------------------- */
/* Enum Value Mappers                                                         */
/* -------------------------------------------------------------------------- */

function mapCategory(
  category?: string | null,
): NewServerExercise["category"] | null {
  if (!category) return null;
  const cat = category.toLowerCase().trim();
  if (cat === "strength") return "strength";
  if (cat === "powerlifting") return "powerlifting";
  if (cat === "olympic weightlifting") return "olympic weightlifting";
  return null;
}

function mapForce(force?: string | null): NewServerExercise["force"] {
  if (!force) return null;
  const f = force.toLowerCase().trim();
  if (f === "push" || f === "pull" || f === "static") return f;
  return null;
}

function mapLevel(level?: string | null): NewServerExercise["level"] {
  if (!level) return null;
  const l = level.toLowerCase().trim();
  if (l === "beginner") return "beginner";
  if (l === "intermediate") return "intermediate";
  if (l === "expert") return "advanced"; // External 'expert' -> schema 'advanced'
  return null;
}

function mapMechanic(mechanic?: string | null): NewServerExercise["mechanic"] {
  if (!mechanic) return null;
  const m = mechanic.toLowerCase().trim();
  if (m === "compound" || m === "isolation") return m;
  return null;
}

function mapEquipment(
  equipment?: string | null,
): NewServerExercise["equipment"] {
  if (!equipment) return null;
  const eq = equipment.toLowerCase().trim();

  switch (eq) {
    case "barbell":
      return "barbell";
    case "dumbbell":
      return "dumbbell";
    case "cable":
      return "cable";
    case "machine":
      return "machine";
    case "kettlebell":
    case "kettlebells":
      return "kettlebell";
    case "body only":
    case "bodyweight":
      return "bodyweight";
    case "bands":
    case "band":
      return "band";
    case "plate":
      return "plate";
    case "smith machine":
    case "smith_machine":
      return "smith_machine";
    case "e-z curl bar":
    case "ez curl bar":
    case "ez_bar":
      return "ez_bar";
    default:
      return null;
  }
}

/* -------------------------------------------------------------------------- */
/* Main Seed Runner                                                           */
/* -------------------------------------------------------------------------- */

export async function seedServerExercises() {
  console.log("Fetching exercise library from GitHub dataset...");
  const res = await fetch(EXERCISE_DATA_URL);

  if (!res.ok) {
    throw new Error(`Failed to fetch dataset: ${res.status} ${res.statusText}`);
  }

  const rawJson: unknown = await res.json();

  if (!Array.isArray(rawJson)) {
    throw new Error("Invalid response format: Expected an array of exercises.");
  }

  console.log(
    `Downloaded ${rawJson.length} raw entries. Validating schema with Zod...`,
  );

  const seenSourceIds = new Set<string>();
  const exercisesToInsert: NewServerExercise[] = [];
  let validationFailures = 0;

  for (const item of rawJson) {
    // 1. Zod Validation Check
    const parsed = freeExerciseSchema.safeParse(item);
    if (!parsed.success) {
      validationFailures++;
      continue;
    }

    const exercise: RawExercise = parsed.data;

    // 2. Filter: Strength & Hypertrophy Categories Only
    const mappedCategory = mapCategory(exercise.category);
    if (!mappedCategory) continue;

    // 3. Filter: Resistance Training Equipment Only
    const mappedEquipment = mapEquipment(exercise.equipment);
    if (!mappedEquipment) continue;

    // 4. Duplicate Check
    if (seenSourceIds.has(exercise.id)) continue;
    seenSourceIds.add(exercise.id);

    // 5. Construct CDN Image URLs
    const imageUrls = exercise.images?.length
      ? exercise.images.map((image) => `${EXERCISE_IMAGE_BASE_URL}/${image}`)
      : null;

    exercisesToInsert.push({
      id: crypto.randomUUID(), // RepForge unique UUID
      sourceId: exercise.id, // Raw dataset string
      name: exercise.name.trim(),
      category: mappedCategory,
      force: mapForce(exercise.force),
      level: mapLevel(exercise.level),
      mechanic: mapMechanic(exercise.mechanic),
      equipment: mappedEquipment,
      primaryMuscle: exercise.primaryMuscles?.[0]?.toLowerCase() || null,
      secondaryMuscles: exercise.secondaryMuscles?.length
        ? exercise.secondaryMuscles.map((m) => m.toLowerCase())
        : null,
      instructions: exercise.instructions?.length
        ? exercise.instructions
        : null,
      images: imageUrls,
      userId: null, // Global RepForge exercise
    });
  }

  if (validationFailures > 0) {
    console.warn(
      `Skipped ${validationFailures} rows that failed Zod validation.`,
    );
  }

  console.log(
    `Validated & filtered down to ${exercisesToInsert.length} strength exercises.`,
  );

  // 6. Batch Insert (Chunks of 50 to maintain Postgres payload limits)
  const chunkSize = 50;
  for (let i = 0; i < exercisesToInsert.length; i += chunkSize) {
    const chunk = exercisesToInsert.slice(i, i + chunkSize);
    await remoteDb
      .insert(exercises)
      .values(chunk)
      .onConflictDoNothing({ target: exercises.sourceId });

    console.log(
      `Seeded chunk: items ${i + 1} to ${Math.min(i + chunkSize, exercisesToInsert.length)}`,
    );
  }

  console.log("PostgreSQL exercise seeding completed successfully!");
}

seedServerExercises()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seeding failed with error:", err);
    process.exit(1);
  });
