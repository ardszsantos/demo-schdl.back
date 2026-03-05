-- DropForeignKey
ALTER TABLE "block_sessions" DROP CONSTRAINT "block_sessions_block_id_fkey";

-- DropForeignKey
ALTER TABLE "blocks" DROP CONSTRAINT "blocks_course_id_fkey";

-- DropForeignKey
ALTER TABLE "ucs" DROP CONSTRAINT "ucs_course_id_fkey";

-- AddForeignKey
ALTER TABLE "ucs" ADD CONSTRAINT "ucs_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "block_sessions" ADD CONSTRAINT "block_sessions_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
