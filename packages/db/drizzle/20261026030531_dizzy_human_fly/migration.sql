CREATE TYPE "provider" AS ENUM('anidb', 'anilist', 'myanimelist');--> statement-breakpoint
CREATE TABLE "discussion_refs" (
	"discussion_id" integer,
	"provider" "provider",
	"external_id" text NOT NULL,
	CONSTRAINT "discussion_refs_pkey" PRIMARY KEY("discussion_id","provider")
);
--> statement-breakpoint
CREATE TABLE "discussions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "discussions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"url" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "discussion_refs" ADD CONSTRAINT "discussion_refs_discussion_id_discussions_id_fkey" FOREIGN KEY ("discussion_id") REFERENCES "discussions"("id");