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
const PostController_1 = __importDefault(require("./PostController"));
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
                    type: user.type,
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
            console.log(typeof (image));
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
                        credit,
                        image
                    },
                });
                res.status(201).json(user);
            }
            catch (err) {
                console.error(err);
                // json a generic server error response
                res.status(500).json('Erreur du serveur');
            }
        });
    }
    static profile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            let userId = +req.params.userId;
            if (!userId) {
                userId = +((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
            }
            const user = yield prisma_1.default.user.findUnique({
                where: { id: userId },
                select: {
                    nom: true,
                    prenom: true,
                    image: true,
                    telephone: true,
                },
            });
            const posts = yield PostController_1.default.getPostOrStoryByUser(userId, "post");
            const stories = yield PostController_1.default.getPostOrStoryByUser(userId, "story");
            res.status(200).json({ posts, stories, user });
        });
    }
    static rechargerCompte(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const { amount } = req.body;
            const userId = +((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
            if (((_b = req.user) === null || _b === void 0 ? void 0 : _b.type) == "client") {
                return res.status(403).json({ error: "Vous ne pouvez pas recharger votre compte client" });
            }
            if (!userId) {
                return res.status(401).json({ error: "Unauthorized" });
            }
            if (amount < 1000) {
                return res.status(400).json({ error: "Le montant doit être supérieur ou égal à 1000" });
            }
            try {
                // Rechercher l'utilisateur par son ID
                const user = yield prisma_1.default.user.findUnique({
                    where: {
                        id: userId,
                    },
                });
                if (!user) {
                    return res.status(404).json({ error: "User not found" });
                }
                // Calculer les crédits à ajouter
                const creditsToAdd = Math.floor(amount / 1000);
                // Mettre à jour les crédits de l'utilisateur
                const updatedUser = yield prisma_1.default.user.update({
                    where: { id: userId },
                    data: {
                        credit: {
                            increment: creditsToAdd, // Incrémenter les crédits actuels
                        },
                    },
                });
                return res.json({ success: true, credits: updatedUser.credit });
            }
            catch (err) {
                console.error(err);
                return res.status(500).json({ error: "Server Error" });
            }
        });
    }
    static ChangeEnTailleur(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = +((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
            try {
                const user = yield prisma_1.default.user.findUnique({ where: { id: userId } });
                if (!user) {
                    return res.status(404).send("User not found");
                }
                if (user.credit < 10) {
                    return res.status(400).send("Insufficient credits to upgrade to Tailleur");
                }
                const updatedUser = yield prisma_1.default.user.update({
                    where: { id: userId },
                    data: {
                        credit: user.credit - 10,
                        type: 'tailleur',
                    },
                });
                res.json({ message: "Account upgraded to Tailleur", credits: updatedUser.credit });
            }
            catch (err) {
                console.error(err);
                res.status(500).send("Server Error");
            }
        });
    }
    static sendMessage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { receiver, content, type, typeId } = req.body;
                const senderId = +req.user.id;
                if (!senderId) {
                    return res.status(401).json({ message: 'Unauthorized' });
                }
                const sender = yield prisma_1.default.user.findUnique({ where: { id: senderId } });
                if (!sender) {
                    return res.status(404).json({ message: 'Sender not found' });
                }
                // Verify that the receiver exists
                const receiverUser = yield prisma_1.default.user.findUnique({ where: { id: receiver } });
                if (!receiverUser) {
                    return res.status(404).json({ message: 'Receiver not found' });
                }
                let relatedEntity = null;
                let idUser;
                if (type && typeId) {
                    if (type === 'post') {
                        relatedEntity = yield prisma_1.default.post.findUnique({ where: { id: typeId } });
                        idUser = relatedEntity === null || relatedEntity === void 0 ? void 0 : relatedEntity.idUser;
                    }
                    else if (type === 'comment') {
                        relatedEntity = yield prisma_1.default.comment.findUnique({ where: { id: typeId } });
                        idUser = relatedEntity === null || relatedEntity === void 0 ? void 0 : relatedEntity.userId;
                    }
                    else if (type === 'message') {
                        relatedEntity = yield prisma_1.default.message.findUnique({ where: { id: typeId } });
                        idUser = relatedEntity === null || relatedEntity === void 0 ? void 0 : relatedEntity.receiverId;
                        console.log(relatedEntity === null || relatedEntity === void 0 ? void 0 : relatedEntity.senderId, senderId, relatedEntity === null || relatedEntity === void 0 ? void 0 : relatedEntity.receiverId, receiver, relatedEntity === null || relatedEntity === void 0 ? void 0 : relatedEntity.receiverId, senderId, relatedEntity === null || relatedEntity === void 0 ? void 0 : relatedEntity.senderId, receiver);
                        if (!(((relatedEntity === null || relatedEntity === void 0 ? void 0 : relatedEntity.senderId) == senderId && (relatedEntity === null || relatedEntity === void 0 ? void 0 : relatedEntity.receiverId) == receiver) || ((relatedEntity === null || relatedEntity === void 0 ? void 0 : relatedEntity.receiverId) == senderId && (relatedEntity === null || relatedEntity === void 0 ? void 0 : relatedEntity.senderId) == receiver))) {
                            return res.status(403).json({ message: 'You are not allowed to send a message between this sender and receiver' });
                        }
                    }
                    else {
                        return res.status(400).json({ message: 'Invalid type specified' });
                    }
                    if (!relatedEntity || (idUser !== receiver && type !== 'message')) {
                        return res.status(404).json({ message: `${type} not found or this ${type} does not belong to the receiver` });
                    }
                }
                const message = yield prisma_1.default.message.create({
                    data: {
                        senderId,
                        receiverId: receiver,
                        content,
                        from: type || null,
                        fromId: typeId || null,
                    },
                });
                res.status(201).json({ message: 'Message sent successfully', data: message });
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ error: error });
            }
        });
    }
    static getMessageUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = +req.user.id;
                if (!userId) {
                    return res.status(401).json({ message: 'Unauthorized' });
                }
                const users = yield prisma_1.default.message.findMany({
                    where: {
                        OR: [
                            { senderId: userId },
                            { receiverId: userId },
                        ],
                    },
                    select: {
                        sender: {
                            select: { id: true, nom: true, prenom: true, image: true },
                        },
                        receiver: {
                            select: { id: true, nom: true, prenom: true, image: true },
                        },
                        createdAt: true,
                        content: true,
                        senderId: true,
                        receiverId: true,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                });
                const userMessagesMap = new Map();
                users.forEach((message) => {
                    const otherUser = message.senderId !== userId ? message.sender : message.receiver;
                    const otherUserId = otherUser.id;
                    if (!userMessagesMap.has(otherUserId)) {
                        userMessagesMap.set(otherUserId, {
                            user: otherUser,
                            lastMessage: {
                                content: message.content,
                                createdAt: message.createdAt,
                            },
                        });
                    }
                });
                const uniqueUsersWithLastMessage = Array.from(userMessagesMap.values());
                res.json(uniqueUsersWithLastMessage);
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ error: error });
            }
        });
    }
    static getDiscussion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = +req.user.id;
                const { otherUserId } = req.params;
                if (!userId) {
                    return res.status(401).json({ message: 'Unauthorized' });
                }
                const messages = yield prisma_1.default.message.findMany({
                    where: {
                        OR: [
                            { senderId: userId, receiverId: Number(otherUserId) },
                            { senderId: Number(otherUserId), receiverId: userId },
                        ],
                    },
                    include: {
                        sender: {
                            select: {
                                id: true,
                                nom: true,
                                prenom: true,
                                mail: true,
                                telephone: true,
                                image: true,
                            },
                        },
                        receiver: {
                            select: {
                                id: true,
                                nom: true,
                                prenom: true,
                                mail: true,
                                telephone: true,
                                image: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'asc',
                    },
                });
                const enrichedMessages = yield Promise.all(messages.map((message) => __awaiter(this, void 0, void 0, function* () {
                    let relatedEntity = null;
                    if (message.from && message.fromId) {
                        if (message.from === 'post') {
                            relatedEntity = yield prisma_1.default.post.findUnique({ where: { id: message.fromId } });
                        }
                        else if (message.from === 'comment') {
                            relatedEntity = yield prisma_1.default.comment.findUnique({ where: { id: message.fromId } });
                        }
                        else if (message.from === 'message') {
                            relatedEntity = yield prisma_1.default.message.findUnique({
                                where: { id: message.fromId },
                                include: {
                                    sender: {
                                        select: {
                                            id: true,
                                            nom: true,
                                            prenom: true,
                                            mail: true,
                                            telephone: true,
                                            image: true,
                                        },
                                    },
                                    receiver: {
                                        select: {
                                            id: true,
                                            nom: true,
                                            prenom: true,
                                            mail: true,
                                            telephone: true,
                                            image: true,
                                        },
                                    },
                                },
                            });
                        }
                    }
                    return Object.assign(Object.assign({}, message), { relatedEntity });
                })));
                res.json(enrichedMessages);
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ error: error });
            }
        });
    }
    static manageFavorites(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { postId } = req.body;
            const userId = +req.user.id; // Assumes `req.id` is set by authentication middleware
            try {
                // Vérifier l'existence de l'utilisateur
                const user = yield prisma_1.default.user.findUnique({
                    where: { id: userId },
                    include: { favoris: true },
                });
                if (!user) {
                    return res.status(400).send('Vous n\'êtes pas connecté');
                }
                // Vérifier l'existence du post
                const post = yield prisma_1.default.post.findUnique({
                    where: { id: postId },
                });
                if (!post) {
                    return res.status(404).send('Le post n\'existe pas');
                }
                // Vérifier si le post est déjà dans les favoris de l'utilisateur
                const isFavorited = user.favoris.some(favPost => favPost.id === postId);
                if (!isFavorited) {
                    // Ajouter le post aux favoris
                    yield prisma_1.default.user.update({
                        where: { id: userId },
                        data: {
                            favoris: {
                                connect: { id: postId },
                            },
                        },
                    });
                    return res.json({ message: "Post ajouté aux favoris" });
                }
                else {
                    // Retirer le post des favoris
                    yield prisma_1.default.user.update({
                        where: { id: userId },
                        data: {
                            favoris: {
                                disconnect: { id: postId },
                            },
                        },
                    });
                    return res.json({ message: "Post retiré des favoris" });
                }
            }
            catch (err) {
                console.error(err);
                res.status(500).send('Erreur du serveur');
            }
        });
    }
    static getUserFavorites(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = +req.user.id; // Assumes `req.id` is set by authentication middleware
            try {
                // Trouver l'utilisateur et ses favoris
                const user = yield prisma_1.default.user.findUnique({
                    where: { id: userId },
                    include: {
                        favoris: {
                            include: {
                                user: {
                                    select: { nom: true, prenom: true, image: true },
                                },
                            },
                        },
                    },
                });
                if (!user) {
                    return res.status(400).send('Vous n\'êtes pas connecté');
                }
                res.json({ favorites: user.favoris });
            }
            catch (err) {
                console.error(err);
                res.status(500).send('Erreur du serveur');
            }
        });
    }
    static getNotif(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            try {
                const notifications = yield prisma_1.default.notification.findMany({
                    where: {
                        userId: +userId,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    select: {
                        id: true,
                        content: true,
                        createdAt: true,
                    },
                });
                if (!notifications.length) {
                    return res.status(404).json({ message: 'No notifications found' });
                }
                return res.status(200).json({ notifications });
            }
            catch (error) {
                console.error('Error fetching notifications:', error);
                return res.status(500).json({ message: 'Internal server error' });
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
    //------------------------------------ADD_Follower--------------------------------
    static addFollower(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const { followedId } = req.body;
            if (!followedId) {
                return res.status(400).send({ error: 'Invalid followedId' });
            }
            console.log('followedId:', followedId);
            try {
                // Trouver l'utilisateur connecté
                const userConnected = yield prisma_1.default.user.findUnique({
                    where: { id: +((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) }
                });
                const userToFollow = yield prisma_1.default.user.findUnique({
                    where: { id: +followedId },
                    include: {
                        followers: {
                            select: {
                                followerId: true // Sélectionne uniquement les IDs des utilisateurs qui suivent cet utilisateur
                            }
                        }
                    }
                });
                if (!userConnected) {
                    return res.status(404).send("User connected not found");
                }
                if (!userToFollow) {
                    return res.status(404).send("User to follow not found");
                }
                if (followedId === ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id)) {
                    return res.status(400).send("Vous ne pouvez pas vous suivre vous-même");
                }
                // Vérification si l'utilisateur suit déjà
                const alreadyFollowing = yield prisma_1.default.follower.findFirst({
                    where: {
                        followerId: userConnected.id,
                        userId: +followedId
                    }
                });
                if (alreadyFollowing) {
                    // Arrêter de suivre
                    yield prisma_1.default.follower.delete({
                        where: {
                            id: alreadyFollowing.id
                        }
                    });
                    return res.status(200).send("Vous avez arrêté de suivre cet utilisateur");
                }
                // Ajouter un nouveau follower
                yield prisma_1.default.follower.create({
                    data: {
                        followerId: userConnected.id,
                        userId: +followedId
                    }
                });
                return res.json(userToFollow);
            }
            catch (err) {
                console.error(err);
                return res.status(500).send("Server Error");
            }
        });
    }
    //------------------------------------GET_FOLLOWERS--------------------------------
    static getFollowers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const userConnected = yield prisma_1.default.user.findUnique({
                where: { id: Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) },
            });
            if (((_b = req.user) === null || _b === void 0 ? void 0 : _b.type) !== 'tailleur') {
                return res.status(403).json({ message: 'Vous devez être un tailleur pour avoir des followers' });
            }
            if (!userConnected) {
                return res.status(404).send("User connected not found");
            }
            // Récupérer les followers de l'utilisateur connecté
            const followers = yield prisma_1.default.follower.findMany({
                where: { userId: Number((_c = req.user) === null || _c === void 0 ? void 0 : _c.id) },
                include: {
                    follower: {
                        select: {
                            id: true,
                            nom: true,
                            prenom: true,
                            image: true,
                        },
                    },
                },
            });
            //Formater les données pour la réponse
            const formattedFollowers = followers.map((f) => ({
                _id: f.follower.id,
                nom: f.follower.nom,
                prenom: f.follower.prenom,
                image: f.follower.image,
            }));
            if (formattedFollowers.length == 0)
                return res.json({ message: "Actuellement, Vous n'avez de  followers", data: [] });
            else
                return res.json({ message: "followers trouvés", data: formattedFollowers });
        });
    }
    //------------------GET_Followings-----------------------------
    static getFollowings(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userConnected = yield prisma_1.default.user.findUnique({
                    where: { id: Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) },
                });
                console.log(userConnected);
                if (!userConnected) {
                    return res.status(404).send("User connected not found");
                }
                // Récupérer les suivis de l'utilisateur connecté à partir de la table Follower
                const followings = yield prisma_1.default.follower.findMany({
                    where: { followerId: userConnected.id },
                    include: { user: true },
                });
                // Construire la liste des suivis avec les détails de l'utilisateur
                const followingDetails = followings.map((following) => ({
                    _id: following.user.id,
                    nom: following.user.nom,
                    prenom: following.user.prenom,
                    image: following.user.image,
                }));
                if (followingDetails.length == 0)
                    return res.json({ message: "Actuellement, Vous ne suivez personne" });
                else
                    return res.json({ data: followingDetails });
            }
            catch (err) {
                console.error(err.message);
                return res.status(500).send('Erreur du serveur');
            }
        });
    }
}
exports.default = UserController;
