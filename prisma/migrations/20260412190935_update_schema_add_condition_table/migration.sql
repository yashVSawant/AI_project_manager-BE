/*
  Warnings:

  - You are about to drop the column `aiOutput` on the `project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `component` ADD COLUMN `active_class_name` VARCHAR(191) NULL,
    ADD COLUMN `on_active_component_id` VARCHAR(191) NULL,
    MODIFY `text` VARCHAR(191) NULL,
    MODIFY `rules` VARCHAR(191) NULL,
    MODIFY `description` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `project` DROP COLUMN `aiOutput`,
    ADD COLUMN `deleted_at` DATETIME(3) NULL,
    MODIFY `description` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `condition` (
    `id` VARCHAR(191) NOT NULL,
    `rule` VARCHAR(191) NOT NULL,
    `project_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `component_condition` (
    `id` VARCHAR(191) NOT NULL,
    `action` ENUM('HIDDEN', 'DISABLED') NOT NULL,
    `condition_id` VARCHAR(191) NOT NULL,
    `component_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `component` ADD CONSTRAINT `component_on_active_component_id_fkey` FOREIGN KEY (`on_active_component_id`) REFERENCES `component`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `condition` ADD CONSTRAINT `condition_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `component_condition` ADD CONSTRAINT `component_condition_condition_id_fkey` FOREIGN KEY (`condition_id`) REFERENCES `condition`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `component_condition` ADD CONSTRAINT `component_condition_component_id_fkey` FOREIGN KEY (`component_id`) REFERENCES `component`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
