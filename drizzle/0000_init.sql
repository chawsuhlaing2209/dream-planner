CREATE TABLE `budget_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`name` text NOT NULL,
	`short_label` text NOT NULL,
	`board_label` text NOT NULL,
	`sort` integer NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `budget_categories_key_unique` ON `budget_categories` (`key`);--> statement-breakpoint
CREATE TABLE `budget_lines` (
	`id` text PRIMARY KEY NOT NULL,
	`category_id` text NOT NULL,
	`name` text NOT NULL,
	`details` text DEFAULT '' NOT NULL,
	`link` text,
	`estimate` integer DEFAULT 0 NOT NULL,
	`paid` integer DEFAULT 0 NOT NULL,
	`sort` integer NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `budget_categories`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `budget_lines_name_unique` ON `budget_lines` (`name`);--> statement-breakpoint
CREATE INDEX `budget_lines_category_idx` ON `budget_lines` (`category_id`);--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` text PRIMARY KEY NOT NULL,
	`period` text NOT NULL,
	`date` text NOT NULL,
	`item` text DEFAULT '' NOT NULL,
	`amount` integer DEFAULT 0 NOT NULL,
	`budget_line_id` text,
	`checked` integer DEFAULT false NOT NULL,
	`sort` integer NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`budget_line_id`) REFERENCES `budget_lines`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `expenses_period_idx` ON `expenses` (`period`);--> statement-breakpoint
CREATE TABLE `fx_notes` (
	`id` text PRIMARY KEY NOT NULL,
	`month` text NOT NULL,
	`sgd_to_mmk` real DEFAULT 0 NOT NULL,
	`thb_to_mmk` real DEFAULT 0 NOT NULL,
	`thb_per_sgd` real DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `fx_notes_month_unique` ON `fx_notes` (`month`);--> statement-breakpoint
CREATE TABLE `holdings` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`amount` integer DEFAULT 0 NOT NULL,
	`sort` integer NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `labour_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`month_id` text NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`days` real DEFAULT 0 NOT NULL,
	`daily_rate` integer DEFAULT 0 NOT NULL,
	`paid` integer DEFAULT 0 NOT NULL,
	`meal_allowance` integer DEFAULT 0 NOT NULL,
	`sort` integer NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`month_id`) REFERENCES `labour_months`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `labour_entries_month_idx` ON `labour_entries` (`month_id`);--> statement-breakpoint
CREATE TABLE `labour_months` (
	`id` text PRIMARY KEY NOT NULL,
	`period` text NOT NULL,
	`meals_paid` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `labour_months_period_unique` ON `labour_months` (`period`);--> statement-breakpoint
CREATE TABLE `loan_transfers` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`from_whom` text DEFAULT '' NOT NULL,
	`amount` integer DEFAULT 0 NOT NULL,
	`into_account` text DEFAULT '' NOT NULL,
	`sort` integer NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `materials` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`price` real DEFAULT 0 NOT NULL,
	`unit` text DEFAULT '' NOT NULL,
	`date` text,
	`qty_needed` real DEFAULT 0 NOT NULL,
	`qty_bought` real DEFAULT 0 NOT NULL,
	`total_cost` integer DEFAULT 0 NOT NULL,
	`paid` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'Unpaid' NOT NULL,
	`sort` integer NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `savings_months` (
	`id` text PRIMARY KEY NOT NULL,
	`month` text NOT NULL,
	`cdg` integer DEFAULT 0 NOT NULL,
	`tf` integer DEFAULT 0 NOT NULL,
	`koko` integer DEFAULT 0 NOT NULL,
	`expense` integer DEFAULT 0 NOT NULL,
	`extra_expense` integer DEFAULT 0 NOT NULL,
	`extra_in` integer DEFAULT 0 NOT NULL,
	`cdg_received` integer DEFAULT false NOT NULL,
	`class_received` integer DEFAULT false NOT NULL,
	`koko_received` integer DEFAULT false NOT NULL,
	`interest_received` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `savings_months_month_unique` ON `savings_months` (`month`);--> statement-breakpoint
CREATE TABLE `settings` (
	`id` text PRIMARY KEY NOT NULL,
	`opening_balance` integer DEFAULT 0 NOT NULL,
	`repay_per_month` integer DEFAULT 0 NOT NULL,
	`loan_compare_month` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `trip_lines` (
	`id` text PRIMARY KEY NOT NULL,
	`trip_id` text NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`currency` text DEFAULT 'MMK' NOT NULL,
	`price` real DEFAULT 0 NOT NULL,
	`qty` real DEFAULT 0 NOT NULL,
	`sort` integer NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `trip_lines_trip_idx` ON `trip_lines` (`trip_id`);--> statement-breakpoint
CREATE TABLE `trip_rates` (
	`id` text PRIMARY KEY NOT NULL,
	`trip_id` text NOT NULL,
	`currency` text NOT NULL,
	`kyat_per_unit` real DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `trip_rates_trip_currency_uq` ON `trip_rates` (`trip_id`,`currency`);--> statement-breakpoint
CREATE TABLE `trips` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`place` text DEFAULT '' NOT NULL,
	`who` text DEFAULT '' NOT NULL,
	`status` text DEFAULT '' NOT NULL,
	`sort` integer NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
