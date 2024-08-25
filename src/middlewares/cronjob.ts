import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import UserController from '../controllers/UserController'; // Ajustez le chemin en fonction de votre structure

const prisma = new PrismaClient();

cron.schedule('0 * * * *', async () => {
    try {
        // Appel de la méthode pour supprimer les stories expirées
        await UserController.deleteExpiredStories();
        console.log('Expired stories deleted');
    } catch (err) {
        console.error('Error deleting expired stories:', err);
    }
});

cron.schedule('0 0 * * *', async () => {
    try {
        // Appel de la méthode pour ajouter des crédits aux utilisateurs 'tailleur'
        await UserController.addCreditsToUsers();
        console.log('1 credit added to all Tailleur users');
    } catch (err) {
        console.error('Error adding credits to Tailleur users:', err);
    }
});

cron.schedule('0 0 * * *', async () => {
    try {
        // Appel de la méthode pour annuler les commandes non validées
        await UserController.deleteOrderAfter1W();
        console.log('Cancelled orders and restored stock');
    } catch (err) {
        console.error('Error processing cancelled orders:', err);
    }
});
