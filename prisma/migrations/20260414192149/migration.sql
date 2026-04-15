/*
  Warnings:

  - A unique constraint covering the columns `[parent_id,order]` on the table `component` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `component` ADD COLUMN `order` INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX `component_parent_id_order_key` ON `component`(`parent_id`, `order`);
