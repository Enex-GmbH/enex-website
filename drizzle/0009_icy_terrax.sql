CREATE TABLE "app_settings" (
	"id" integer PRIMARY KEY NOT NULL,
	"maintenance_enabled" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
INSERT INTO "app_settings" ("id", "maintenance_enabled") VALUES (1, false);
