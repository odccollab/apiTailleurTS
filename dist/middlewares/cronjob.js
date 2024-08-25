"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const client_1 = require("@prisma/client");
const UserController_1 = __importDefault(require("../controllers/UserController")); // Ajustez le chemin en fonction de votre structure
const prisma = new client_1.PrismaClient();
node_cron_1.default.schedule('0 * * * *', () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Appel de la méthode pour supprimer les stories expirées
        yield UserController_1.default.deleteExpiredStories();
        console.log('Expired stories deleted');
    }
    catch (err) {
        console.error('Error deleting expired stories:', err);
    }
}));
node_cron_1.default.schedule('0 0 * * *', () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Appel de la méthode pour ajouter des crédits aux utilisateurs 'tailleur'
        yield UserController_1.default.addCreditsToUsers();
        console.log('1 credit added to all Tailleur users');
    }
    catch (err) {
        console.error('Error adding credits to Tailleur users:', err);
    }
}));
node_cron_1.default.schedule('0 0 * * *', () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Appel de la méthode pour annuler les commandes non validées
        yield UserController_1.default.deleteOrderAfter1W();
        console.log('Cancelled orders and restored stock');
    }
    catch (err) {
        console.error('Error processing cancelled orders:', err);
    }
}));
