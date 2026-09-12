ALTER TABLE `two_factors` ADD `verified` integer;--> statement-breakpoint
ALTER TABLE `two_factors` ADD `failed_verification_count` integer;--> statement-breakpoint
ALTER TABLE `two_factors` ADD `locked_until` integer;