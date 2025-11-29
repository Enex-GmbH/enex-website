ALTER TABLE "bookings" ADD COLUMN "customer_first_name" varchar(80) NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "customer_last_name" varchar(80) NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "agreed_to_terms" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "agreed_to_privacy" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "agreed_to_service" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "customer_name";