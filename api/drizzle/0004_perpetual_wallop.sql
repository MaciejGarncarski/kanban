ALTER TABLE "boards" ADD COLUMN "readable_id" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "readable_id" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "boards" ADD CONSTRAINT "boards_readable_id_unique" UNIQUE("readable_id");--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_readable_id_unique" UNIQUE("readable_id");