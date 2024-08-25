/*
  Warnings:

  - Added the required column `idVendeur` to the `commande` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `commande` ADD COLUMN `idVendeur` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `commande` ADD CONSTRAINT `commande_idVendeur_fkey` FOREIGN KEY (`idVendeur`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
