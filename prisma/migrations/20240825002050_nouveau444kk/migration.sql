/*
  Warnings:

  - You are about to drop the `_ArticleCommandes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_ArticleCommandes` DROP FOREIGN KEY `_ArticleCommandes_A_fkey`;

-- DropForeignKey
ALTER TABLE `_ArticleCommandes` DROP FOREIGN KEY `_ArticleCommandes_B_fkey`;

-- DropTable
DROP TABLE `_ArticleCommandes`;

-- CreateTable
CREATE TABLE `commande_article` (
    `idCommande` INTEGER NOT NULL,
    `idArticle` INTEGER NOT NULL,
    `quantite` INTEGER NOT NULL,

    PRIMARY KEY (`idCommande`, `idArticle`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `commande_article` ADD CONSTRAINT `commande_article_idCommande_fkey` FOREIGN KEY (`idCommande`) REFERENCES `commande`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commande_article` ADD CONSTRAINT `commande_article_idArticle_fkey` FOREIGN KEY (`idArticle`) REFERENCES `article`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
