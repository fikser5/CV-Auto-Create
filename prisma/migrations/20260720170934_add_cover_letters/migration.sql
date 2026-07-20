-- CreateTable
CREATE TABLE "generated_cover_letters" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "job_posting_id" TEXT NOT NULL,
    "content_json" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "generated_cover_letters_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "generated_cover_letters" ADD CONSTRAINT "generated_cover_letters_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_cover_letters" ADD CONSTRAINT "generated_cover_letters_job_posting_id_fkey" FOREIGN KEY ("job_posting_id") REFERENCES "job_postings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
