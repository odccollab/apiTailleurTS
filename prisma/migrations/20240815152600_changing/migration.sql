/*
  Warnings:

  - You are about to drop the column `email` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[mail]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `mail` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `user_email_key` ON `user`;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `email`,
    ADD COLUMN `mail` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `user_mail_key` ON `user`(`mail`);
