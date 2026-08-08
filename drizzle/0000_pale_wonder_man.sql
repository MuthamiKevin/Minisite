CREATE TABLE `rsvps` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`contact` text NOT NULL,
	`attendance` text NOT NULL,
	`guest_count` integer DEFAULT 1 NOT NULL,
	`blessing` text,
	`song` text,
	`created_at` integer NOT NULL
);
