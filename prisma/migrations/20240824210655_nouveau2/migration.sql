/*
  Warnings:

  - You are about to drop the column `idArticle` on the `commande` table. All the data in the column will be lost.
  - You are about to drop the column `quantite` on the `commande` table. All the data in the column will be lost.
  - Added the required column `categorie` to the `article` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `commande` DROP FOREIGN KEY `commande_idArticle_fkey`;

-- AlterTable
ALTER TABLE `article` ADD COLUMN `categorie` VARCHAR(191) NOT NULL,
    ADD COLUMN `description` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `commande` DROP COLUMN `idArticle`,
    DROP COLUMN `quantite`;

-- CreateTable
CREATE TABLE `_ArticleCommandes` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_ArticleCommandes_AB_unique`(`A`, `B`),
    INDEX `_ArticleCommandes_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_ArticleCommandes` ADD CONSTRAINT `_ArticleCommandes_A_fkey` FOREIGN KEY (`A`) REFERENCES `article`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ArticleCommandes` ADD CONSTRAINT `_ArticleCommandes_B_fkey` FOREIGN KEY (`B`) REFERENCES `commande`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
