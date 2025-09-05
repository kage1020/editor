CREATE TABLE `editor_contents` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`content` text NOT NULL,
	`json` text NOT NULL,
	`title` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);