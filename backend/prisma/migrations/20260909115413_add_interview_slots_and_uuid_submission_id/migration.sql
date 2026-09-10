/*
  Warnings:

  - The primary key for the `form_submissions` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE `submission_answers` DROP FOREIGN KEY `submission_answers_submission_id_fkey`;

-- DropIndex
DROP INDEX `submission_answers_submission_id_fkey` ON `submission_answers`;

-- AlterTable
ALTER TABLE `form_submissions` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `submission_answers` MODIFY `submission_id` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `interview_slots` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `form_id` VARCHAR(191) NOT NULL,
    `submission_id` VARCHAR(191) NULL,
    `start_time` DATETIME(3) NOT NULL,
    `end_time` DATETIME(3) NOT NULL,
    `status` ENUM('AVAILABLE', 'BOOKED', 'CANCELLED') NOT NULL DEFAULT 'AVAILABLE',
    `meeting_link` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `interview_slots_submission_id_key`(`submission_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `submission_answers` ADD CONSTRAINT `submission_answers_submission_id_fkey` FOREIGN KEY (`submission_id`) REFERENCES `form_submissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `interview_slots` ADD CONSTRAINT `interview_slots_form_id_fkey` FOREIGN KEY (`form_id`) REFERENCES `forms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `interview_slots` ADD CONSTRAINT `interview_slots_submission_id_fkey` FOREIGN KEY (`submission_id`) REFERENCES `form_submissions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
