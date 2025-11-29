CREATE TABLE "franchises" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"currency" varchar(5) DEFAULT 'EUR',
	"timezone" varchar(50) DEFAULT 'Europe/Berlin',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "franchises_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "booking_events" ADD COLUMN "franchise_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "franchise_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "franchise_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "time_slots" ADD COLUMN "franchise_id" integer NOT NULL;