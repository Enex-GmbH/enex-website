CREATE TABLE "booking_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer NOT NULL,
	"from_status" varchar(20),
	"to_status" varchar(20),
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"reference" varchar(20) NOT NULL,
	"postal_code" varchar(10) NOT NULL,
	"address" text NOT NULL,
	"is_inside_zone" boolean NOT NULL,
	"toll_fee" integer DEFAULT 0,
	"water_available" boolean DEFAULT false,
	"electricity_available" boolean DEFAULT false,
	"car_type" varchar(20) NOT NULL,
	"plan" varchar(20) NOT NULL,
	"addons" jsonb DEFAULT '[]'::jsonb,
	"date" varchar(20) NOT NULL,
	"time" varchar(10) NOT NULL,
	"customer_name" varchar(80) NOT NULL,
	"customer_email" varchar(120) NOT NULL,
	"customer_phone" varchar(40) NOT NULL,
	"license_plate" varchar(20),
	"car_make" varchar(50),
	"parking_notes" text,
	"coupon_code" varchar(50),
	"total_price" integer NOT NULL,
	"currency" varchar(5) DEFAULT 'EUR' NOT NULL,
	"stripe_payment_intent_id" varchar(255),
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "bookings_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer NOT NULL,
	"stripe_payment_intent_id" varchar(255) NOT NULL,
	"amount" integer NOT NULL,
	"status" varchar(20) NOT NULL,
	"currency" varchar(5) DEFAULT 'EUR',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "time_slots" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" varchar(20) NOT NULL,
	"time" varchar(10) NOT NULL,
	"is_booked" boolean DEFAULT false,
	"booking_id" integer
);
