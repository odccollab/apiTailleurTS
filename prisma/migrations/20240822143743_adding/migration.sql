-- AlterTable
ALTER TABLE `message` ADD COLUMN `from` VARCHAR(191) NULL,
    ADD COLUMN `fromId` INTEGER NULL;
