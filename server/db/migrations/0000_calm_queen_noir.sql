CREATE TABLE `admin_audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_user_id` text NOT NULL,
	`action` text NOT NULL,
	`target_type` text NOT NULL,
	`target_id` text NOT NULL,
	`summary` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `admin_audit_log_created_at_idx` ON `admin_audit_log` (`created_at`);--> statement-breakpoint
CREATE INDEX `admin_audit_log_actor_user_id_idx` ON `admin_audit_log` (`actor_user_id`);--> statement-breakpoint
CREATE TABLE `admin_login_log` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`user_id` text,
	`result` text NOT NULL,
	`reason` text,
	`ip` text,
	`user_agent` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `admin_login_log_created_at_idx` ON `admin_login_log` (`created_at`);--> statement-breakpoint
CREATE INDEX `admin_login_log_username_idx` ON `admin_login_log` (`username`);--> statement-breakpoint
CREATE TABLE `admin_permission` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`group_key` text NOT NULL,
	`route_path` text NOT NULL,
	`description` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admin_permission_code_unique` ON `admin_permission` (`code`);--> statement-breakpoint
CREATE INDEX `admin_permission_created_at_idx` ON `admin_permission` (`created_at`);--> statement-breakpoint
CREATE TABLE `admin_role` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`code` text NOT NULL,
	`description` text NOT NULL,
	`is_system` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admin_role_code_unique` ON `admin_role` (`code`);--> statement-breakpoint
CREATE INDEX `admin_role_created_at_idx` ON `admin_role` (`created_at`);--> statement-breakpoint
CREATE TABLE `admin_role_permission` (
	`id` text PRIMARY KEY NOT NULL,
	`role_id` text NOT NULL,
	`permission_id` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admin_role_permission_role_permission_unique` ON `admin_role_permission` (`role_id`,`permission_id`);--> statement-breakpoint
CREATE INDEX `admin_role_permission_role_id_idx` ON `admin_role_permission` (`role_id`);--> statement-breakpoint
CREATE INDEX `admin_role_permission_permission_id_idx` ON `admin_role_permission` (`permission_id`);--> statement-breakpoint
CREATE TABLE `admin_user` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`display_name` text NOT NULL,
	`password_hash` text NOT NULL,
	`status` text NOT NULL,
	`token_version` integer NOT NULL,
	`last_login_at` text,
	`password_changed_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	CONSTRAINT "admin_user_status_check" CHECK("admin_user"."status" in ('active', 'disabled')),
	CONSTRAINT "admin_user_token_version_check" CHECK("admin_user"."token_version" > 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admin_user_username_unique` ON `admin_user` (`username`);--> statement-breakpoint
CREATE INDEX `admin_user_created_at_idx` ON `admin_user` (`created_at`);--> statement-breakpoint
CREATE TABLE `admin_user_role` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`role_id` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admin_user_role_user_role_unique` ON `admin_user_role` (`user_id`,`role_id`);--> statement-breakpoint
CREATE INDEX `admin_user_role_user_id_idx` ON `admin_user_role` (`user_id`);--> statement-breakpoint
CREATE INDEX `admin_user_role_role_id_idx` ON `admin_user_role` (`role_id`);