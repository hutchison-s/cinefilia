CREATE TABLE "shared_list" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"share_id" uuid NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"sharing_user_id" text NOT NULL,
	"target_user_id" text,
	"pending_at" timestamp DEFAULT now() NOT NULL,
	"accepted_at" timestamp,
	"rejected_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "shared_list" ADD CONSTRAINT "shared_list_sharing_user_id_user_id_fk" FOREIGN KEY ("sharing_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shared_list" ADD CONSTRAINT "shared_list_target_user_id_user_id_fk" FOREIGN KEY ("target_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "shared_list_share_idx" ON "shared_list" USING btree ("share_id");--> statement-breakpoint
CREATE INDEX "shared_list_sharing_user_idx" ON "shared_list" USING btree ("sharing_user_id");--> statement-breakpoint
CREATE INDEX "shared_list_target_user_idx" ON "shared_list" USING btree ("target_user_id");--> statement-breakpoint
CREATE INDEX "shared_list_status_idx" ON "shared_list" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "shared_list_share_target_unique" ON "shared_list" USING btree ("share_id","target_user_id");