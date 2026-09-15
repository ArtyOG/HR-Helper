/*
  Warnings:

  - You are about to drop the column `ai_error` on the `form_submissions` table. All the data in the column will be lost.
  - You are about to drop the column `ai_score_status` on the `form_submissions` table. All the data in the column will be lost.
  - You are about to drop the column `cv_file_id` on the `form_submissions` table. All the data in the column will be lost.
  - You are about to drop the column `cv_score` on the `form_submissions` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `form_submissions` DROP FOREIGN KEY `form_submissions_cv_file_id_fkey`;

-- DropIndex
DROP INDEX `form_submissions_cv_file_id_key` ON `form_submissions`;

-- AlterTable
ALTER TABLE `form_submissions` DROP COLUMN `ai_error`,
    DROP COLUMN `ai_score_status`,
    DROP COLUMN `cv_file_id`,
    DROP COLUMN `cv_score`;

-- CreateTable
CREATE TABLE `cv_evaluations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `submission_id` INTEGER NOT NULL,
    `file_id` INTEGER NOT NULL,
    `score` DOUBLE NULL,
    `status` ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'SKIPPED') NOT NULL DEFAULT 'PENDING',
    `error` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `cv_evaluations_submission_id_key`(`submission_id`),
    UNIQUE INDEX `cv_evaluations_file_id_key`(`file_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `cv_evaluations` ADD CONSTRAINT `cv_evaluations_submission_id_fkey` FOREIGN KEY (`submission_id`) REFERENCES `form_submissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cv_evaluations` ADD CONSTRAINT `cv_evaluations_file_id_fkey` FOREIGN KEY (`file_id`) REFERENCES `files`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
