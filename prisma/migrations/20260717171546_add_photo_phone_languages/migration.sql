-- CreateEnum
CREATE TYPE "LanguageLevel" AS ENUM ('A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'native');

-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "phone" TEXT,
ADD COLUMN     "photo_url" TEXT;

-- CreateTable
CREATE TABLE "languages" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" "LanguageLevel" NOT NULL,
    "order_index" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "languages_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "languages" ADD CONSTRAINT "languages_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
