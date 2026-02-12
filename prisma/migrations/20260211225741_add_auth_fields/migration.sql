/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `people` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[google_id]` on the table `people` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "people" ADD COLUMN     "google_id" TEXT,
ADD COLUMN     "password_hash" TEXT,
ADD COLUMN     "refresh_token" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "people_email_key" ON "people"("email");

-- CreateIndex
CREATE UNIQUE INDEX "people_google_id_key" ON "people"("google_id");
