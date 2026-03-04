/*
  Warnings:

  - You are about to drop the column `day_of_week` on the `block_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `end_time` on the `block_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `room_id` on the `block_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `start_time` on the `block_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `monthly_hours_limit` on the `teachers` table. All the data in the column will be lost.
  - You are about to drop the column `weekly_hours_limit` on the `teachers` table. All the data in the column will be lost.
  - You are about to drop the `teacher_availabilities` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `teacher_blocks` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `date` to the `block_sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end_time` to the `blocks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_time` to the `blocks` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "block_sessions" DROP CONSTRAINT "block_sessions_room_id_fkey";

-- DropForeignKey
ALTER TABLE "teacher_availabilities" DROP CONSTRAINT "teacher_availabilities_teacher_id_fkey";

-- DropForeignKey
ALTER TABLE "teacher_blocks" DROP CONSTRAINT "teacher_blocks_teacher_id_fkey";

-- AlterTable
ALTER TABLE "block_sessions" DROP COLUMN "day_of_week",
DROP COLUMN "end_time",
DROP COLUMN "room_id",
DROP COLUMN "start_time",
ADD COLUMN     "date" DATE NOT NULL;

-- AlterTable
ALTER TABLE "blocks" ADD COLUMN     "days_of_week" INTEGER[],
ADD COLUMN     "end_time" TIME(6) NOT NULL,
ADD COLUMN     "room_id" TEXT,
ADD COLUMN     "start_time" TIME(6) NOT NULL,
ALTER COLUMN "start_date" SET DATA TYPE DATE,
ALTER COLUMN "projected_end_date" SET DATA TYPE DATE;

-- AlterTable
ALTER TABLE "calendar_events" ALTER COLUMN "date" SET DATA TYPE DATE;

-- AlterTable
ALTER TABLE "teachers" DROP COLUMN "monthly_hours_limit",
DROP COLUMN "weekly_hours_limit";

-- DropTable
DROP TABLE "teacher_availabilities";

-- DropTable
DROP TABLE "teacher_blocks";

-- AddForeignKey
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;
