CREATE TABLE "projects" (
	"id" serial PRIMARY KEY,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"description" text DEFAULT '',
	"software" text[] DEFAULT '{}'::text[],
	"year" integer DEFAULT 2024,
	"images" text[] DEFAULT '{}'::text[],
	"thumbnail" text DEFAULT '',
	"video" text DEFAULT '',
	"breakdowns" jsonb DEFAULT '[]',
	"created_at" timestamp DEFAULT now()
);
