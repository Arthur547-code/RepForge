CREATE TABLE IF NOT EXISTS `sync_queue` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`entity` text NOT NULL,
	`operation` text NOT NULL,
	`entity_id` text NOT NULL,
	`payload` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`max_attempts` integer DEFAULT 5 NOT NULL,
	`last_error` text,
	`created_at` integer NOT NULL,
	`next_retry_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
