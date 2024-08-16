/*
  Warnings:

  - You are about to drop the column `content` on the `post` table. All the data in the column will be lost.
  - Added the required column `contenu` to the `post` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `post` DROP COLUMN `content`,
    ADD COLUMN `contenu` VARCHAR(191) NOT NULL;
