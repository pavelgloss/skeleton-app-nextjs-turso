CREATE TABLE `skeletonapp_rate_limits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ip` text NOT NULL,
	`endpoint` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `skeletonapp_idx_rate_limits_lookup` ON `skeletonapp_rate_limits` (`ip`,`endpoint`,`created_at`);--> statement-breakpoint
CREATE TABLE `skeletonapp_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`clerk_id` text NOT NULL,
	`email` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `skeletonapp_users_clerk_id_unique` ON `skeletonapp_users` (`clerk_id`);