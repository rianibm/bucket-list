CREATE TABLE "ai_quotas" (
	"key" text PRIMARY KEY,
	"count" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
