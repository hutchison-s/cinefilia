CREATE TABLE "genre" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"backdrop_path" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "genre_name_unique" ON "genre" USING btree ("name");