CREATE TABLE "blog_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"summary" text NOT NULL,
	"content" text NOT NULL,
	"emoji" varchar(50),
	"slug" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"scenario" varchar(100) NOT NULL,
	"final_score" integer NOT NULL,
	"result" varchar(20) NOT NULL,
	"played_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leaderboard" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"username" varchar(50) NOT NULL,
	"best_score" integer NOT NULL,
	"scenario" varchar(100) NOT NULL,
	"achieved_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(50) NOT NULL,
	"password" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "blog_posts_slug_idx" ON "blog_posts" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "blog_posts_created_at_idx" ON "blog_posts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "game_records_user_id_idx" ON "game_records" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "game_records_played_at_idx" ON "game_records" USING btree ("played_at");--> statement-breakpoint
CREATE UNIQUE INDEX "leaderboard_user_id_idx" ON "leaderboard" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "leaderboard_best_score_idx" ON "leaderboard" USING btree ("best_score");--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_idx" ON "users" USING btree ("username");