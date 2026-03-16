ALTER TABLE "shared_list" RENAME TO "connection";--> statement-breakpoint
ALTER TABLE "connection" RENAME COLUMN "sharing_user_id" TO "initiator_user_id";--> statement-breakpoint
ALTER TABLE "connection" RENAME COLUMN "target_user_id" TO "recipient_user_id";--> statement-breakpoint
ALTER TABLE "connection" DROP CONSTRAINT "shared_list_sharing_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "connection" DROP CONSTRAINT "shared_list_target_user_id_user_id_fk";
--> statement-breakpoint
DROP INDEX "shared_list_share_idx";--> statement-breakpoint
DROP INDEX "shared_list_sharing_user_idx";--> statement-breakpoint
DROP INDEX "shared_list_target_user_idx";--> statement-breakpoint
DROP INDEX "shared_list_status_idx";--> statement-breakpoint
DROP INDEX "shared_list_share_target_unique";--> statement-breakpoint
ALTER TABLE "connection" ADD CONSTRAINT "connection_initiator_user_id_user_id_fk" FOREIGN KEY ("initiator_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connection" ADD CONSTRAINT "connection_recipient_user_id_user_id_fk" FOREIGN KEY ("recipient_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "connection_share_idx" ON "connection" USING btree ("share_id");--> statement-breakpoint
CREATE INDEX "connection_initiator_user_idx" ON "connection" USING btree ("initiator_user_id");--> statement-breakpoint
CREATE INDEX "connection_recipient_user_idx" ON "connection" USING btree ("recipient_user_id");--> statement-breakpoint
CREATE INDEX "connection_status_idx" ON "connection" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "connection_share_recipient_unique" ON "connection" USING btree ("share_id","recipient_user_id");--> statement-breakpoint
ALTER TABLE "connection" DROP COLUMN "type";