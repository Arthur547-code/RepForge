CREATE TABLE `exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`source_id` text,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`force` text,
	`level` text,
	`mechanic` text,
	`equipment` text,
	`primary_muscle` text,
	`secondary_muscles` text,
	`instructions` text,
	`images` text,
	`user_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `exercises_source_id_unique` ON `exercises` (`source_id`);