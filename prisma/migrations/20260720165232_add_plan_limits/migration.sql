-- AlterTable
ALTER TABLE "users" ADD COLUMN     "free_generation_used" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "has_ever_purchased" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "plan_renews_at" TIMESTAMP(3),
ADD COLUMN     "purchased_credits" INTEGER NOT NULL DEFAULT 0;
