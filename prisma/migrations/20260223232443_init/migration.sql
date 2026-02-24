-- CreateEnum
CREATE TYPE "Role" AS ENUM ('COORDINATOR', 'OPP');

-- CreateEnum
CREATE TYPE "BlockStatus" AS ENUM ('PLANNED', 'ACTIVE', 'FINISHED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CalendarEventType" AS ENUM ('HOLIDAY', 'RECESS', 'BLOCK');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teachers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "registration" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "employment_type" TEXT,
    "weekly_hours_limit" DECIMAL(65,30),
    "monthly_hours_limit" DECIMAL(65,30),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_availabilities" (
    "id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,

    CONSTRAINT "teacher_availabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_blocks" (
    "id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,

    CONSTRAINT "teacher_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blocks" (
    "id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "total_hours" DECIMAL(65,30) NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "projected_end_date" TIMESTAMP(3),
    "status" "BlockStatus" NOT NULL DEFAULT 'PLANNED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "block_sessions" (
    "id" TEXT NOT NULL,
    "block_id" TEXT NOT NULL,
    "room_id" TEXT,
    "day_of_week" INTEGER NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,

    CONSTRAINT "block_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendar_events" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CalendarEventType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "calendar_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "teacher_availabilities" ADD CONSTRAINT "teacher_availabilities_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_blocks" ADD CONSTRAINT "teacher_blocks_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "block_sessions" ADD CONSTRAINT "block_sessions_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "blocks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "block_sessions" ADD CONSTRAINT "block_sessions_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;
