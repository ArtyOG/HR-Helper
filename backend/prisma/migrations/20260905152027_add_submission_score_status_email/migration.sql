/*
  Warnings:

  - Added the required column `email` to the `form_submissions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `form_submissions` ADD COLUMN `cv_score` DOUBLE NULL,
    ADD COLUMN `email` VARCHAR(191) NOT NULL,
    ADD COLUMN `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING';
