-- DropForeignKey
ALTER TABLE `component` DROP FOREIGN KEY `component_parent_id_fkey`;

-- DropIndex
DROP INDEX `component_parent_id_order_key` ON `component`;

-- CreateTable
CREATE TABLE `project_invite` (
    `id` VARCHAR(191) NOT NULL,
    `project_id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `invited_by_id` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'EDITOR', 'VIEWER') NOT NULL,
    `status` ENUM('PENDING', 'ACCEPTED', 'EXPIRED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `expiresAt` DATETIME(3) NOT NULL,
    `acceptedAt` DATETIME(3) NULL,
    `invited_user_id` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `project_invite_project_id_email_key`(`project_id`, `email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `project_invite` ADD CONSTRAINT `project_invite_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_invite` ADD CONSTRAINT `project_invite_invited_by_id_fkey` FOREIGN KEY (`invited_by_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_invite` ADD CONSTRAINT `project_invite_invited_user_id_fkey` FOREIGN KEY (`invited_user_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
