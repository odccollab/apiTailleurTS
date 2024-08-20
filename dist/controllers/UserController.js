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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../prisma"));
const utils_1 = __importDefault(require("../utils/utils"));
const User_1 = __importDefault(require("../models/User"));
// {
//   "nom":"fallou",
//    "prenom":"sylla",
//     "mail":"fallou53@gmail.com",
//      "password":"passer123",
//      "passconfirm":"passer123",
//       "telephone":"754378671",
//       "type":"Client",
//       "image":"fs.png"
// } 
class UserController {
    static loginUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { mail, password } = req.body;
            try {
                const user = yield User_1.default.findUnique({ mail: mail });
                if (!user || !utils_1.default.compPass(password, user.password)) {
                    res.status(400).json({ message: 'Invalid credentials' });
                    return;
                }
                const SECRET_KEY = process.env.SECRET_KEY;
                if (!SECRET_KEY) {
                    throw new Error('SECRET_KEY is not defined in the environment variables');
                }
                const token = jsonwebtoken_1.default.sign({
                    id: user.id,
                    role: user.type,
                    nom: user.nom,
                    prenom: user.prenom,
                    image: user.image // Assuming 'i' refers to a photo field, adjust if needed
                }, SECRET_KEY, { expiresIn: '7h' });
                res.json({ success: "connected", token });
            }
            catch (err) {
                console.error(err);
                res.status(500).json('Server Error');
            }
        });
    }
    //-------------------------CREATE_USER------------------------
    static createUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nom, prenom, mail, password, passconfirm, telephone, type, image } = req.body;
            // Check if passwords match
            if (password !== passconfirm) {
                res.status(400).json('Les mots de passe ne correspondent pas');
                return;
            }
            try {
                let user = yield prisma_1.default.user.findUnique({ where: { mail } });
                if (!user) {
                    user = yield prisma_1.default.user.findUnique({ where: { telephone } });
                }
                if (user) {
                    res.status(409).json('Un utilisateur avec cet e-mail ou numéro de téléphone existe déjà.');
                    return;
                }
                // Set initial credit based on the user type
                let credit = type === "tailleur" ? 10 : 3;
                // Hash the password
                const hashedPassword = utils_1.default.hashPassword(password);
                // Create the user
                user = yield prisma_1.default.user.create({
                    data: {
                        nom,
                        prenom,
                        mail,
                        password: hashedPassword,
                        telephone,
                        type,
                        image,
                        credit
                    },
                });
                // json a success response
                res.status(201).json(user);
            }
            catch (err) {
                console.error(err);
                // json a generic server error response
                res.status(500).json('Erreur du serveur');
            }
        });
    }
    //----------------ADD_NOTIFICATION----------------------------
    static addNotification(userId, content) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Crée une nouvelle notification pour l'utilisateur
                yield prisma_1.default.notification.create({
                    data: {
                        userId,
                        content,
                    }
                });
            }
            catch (err) {
                console.error('Erreur lors de l\'ajout de la notification:', err);
            }
        });
    }
    //---------------------------------------VOTE-----------------------------------------
    static manageVotes(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { voteForUserId } = req.body;
            const userId = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id); // Récupération de l'ID de l'utilisateur depuis le middleware d'authentification
            try {
                // Vérifier l'existence de l'utilisateur à voter
                const userToVote = yield prisma_1.default.user.findUnique({ where: { id: voteForUserId } });
                if (!userToVote) {
                    return res.status(404).send("L'utilisateur n'existe pas");
                }
                // Vérifier que l'utilisateur ne vote pas pour lui-même
                if (userId === voteForUserId) {
                    return res.status(400).send("Vous ne pouvez pas voter pour vous-même");
                }
                // Trouver le vote existant
                const existingVote = yield prisma_1.default.vote.findFirst({
                    where: { idVoteur: userId, userId: voteForUserId },
                });
                if (!existingVote) {
                    // L'utilisateur n'a pas encore voté, donc on ajoute le vote
                    yield prisma_1.default.vote.create({
                        data: {
                            idVoteur: userId,
                            userId: voteForUserId,
                        },
                    });
                    return res.json({ message: "Vous avez voté pour cet utilisateur" });
                }
                else {
                    // L'utilisateur a déjà voté, donc on supprime le vote
                    yield prisma_1.default.vote.delete({
                        where: { id: existingVote.id },
                    });
                    return res.json({ message: "Vous avez retiré votre vote" });
                }
            }
            catch (err) {
                console.error(err.message);
                return res.status(500).send('Erreur du serveur');
            }
        });
    }
}
exports.default = UserController;
