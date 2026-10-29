CREATE TABLE IF NOT EXISTS `profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`gender` text NOT NULL,
	`experience_level` text NOT NULL,
	`training_goal` text NOT NULL,
	`weight_unit` text DEFAULT 'kg' NOT NULL,
	`onboarding_completed_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `profiles_user_id_unique` ON `profiles` (`user_id`);
