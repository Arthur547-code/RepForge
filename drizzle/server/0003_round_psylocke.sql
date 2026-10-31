CREATE TYPE "public"."exercise_category" AS ENUM('strength', 'powerlifting', 'olympic weightlifting');--> statement-breakpoint
CREATE TYPE "public"."exercise_equipment" AS ENUM('barbell', 'dumbbell', 'cable', 'machine', 'kettlebell', 'bodyweight', 'band', 'plate', 'smith_machine', 'ez_bar', 'other');--> statement-breakpoint
CREATE TYPE "public"."exercise_force" AS ENUM('push', 'pull', 'static');--> statement-breakpoint
CREATE TYPE "public"."exercise_level" AS ENUM('beginner', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TYPE "public"."exercise_mechanic" AS ENUM('compound', 'isolation');--> statement-breakpoint
CREATE TABLE "exercises" (
	"id" uuid PRIMARY KEY NOT NULL,
	"source_id" text,
	"name" text NOT NULL,
	"category" "exercise_category" NOT NULL,
	"force" "exercise_force",
	"level" "exercise_level",
	"mechanic" "exercise_mechanic",
	"equipment" "exercise_equipment",
	"primary_muscle" text,
	"secondary_muscles" text[],
	"instructions" text[],
	"images" text[],
	"user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "exercises_source_id_unique" UNIQUE("source_id")
);
