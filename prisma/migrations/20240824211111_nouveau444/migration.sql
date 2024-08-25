-- AlterTable
ALTER TABLE `commande` ADD COLUMN `etat` VARCHAR(191) NOT NULL DEFAULT 'non confirmé',
    ADD COLUMN `prixTotal` DOUBLE NOT NULL DEFAULT 0;
