/*
  Warnings:

  - Changed the type of `start_time` on the `block_sessions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `end_time` on the `block_sessions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `type` to the `courses` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `start_time` on the `teacher_availabilities` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `end_time` on the `teacher_availabilities` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "CourseType" AS ENUM ('FIC', 'REGULAR');

-- AlterTable
ALTER TABLE "block_sessions" DROP COLUMN "start_time",
ADD COLUMN     "start_time" TIME NOT NULL,
DROP COLUMN "end_time",
ADD COLUMN     "end_time" TIME NOT NULL;

-- AlterTable
ALTER TABLE "blocks" ADD COLUMN     "uc_id" TEXT;

-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "type" "CourseType" NOT NULL;

-- AlterTable
ALTER TABLE "teacher_availabilities" DROP COLUMN "start_time",
ADD COLUMN     "start_time" TIME NOT NULL,
DROP COLUMN "end_time",
ADD COLUMN     "end_time" TIME NOT NULL;

-- CreateTable
CREATE TABLE "ucs" (
    "id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "total_hours" DECIMAL(65,30) NOT NULL,
    "order" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ucs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ucs" ADD CONSTRAINT "ucs_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_uc_id_fkey" FOREIGN KEY ("uc_id") REFERENCES "ucs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
