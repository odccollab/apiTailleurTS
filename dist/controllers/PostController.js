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
const prisma_1 = __importDefault(require("../prisma"));
class PostController {
    static createPost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { contenu, contenuMedia, type } = req.body;
            try {
                const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) ? parseInt(req.user.id, 10) : null;
                if (!userId) {
                    res.status(401).send("Unauthorized");
                    return;
                }
                const user = yield prisma_1.default.user.findUnique({ where: { id: userId } });
                if (!user) {
                    res.status(404).send("User not found");
                    return;
                }
                // Initialize post data
                const postData = {
                    contenu,
                    createdAt: new Date(),
                    user: { connect: { id: userId } }
                };
                // If contenuMedia is defined and is an array, map over it
                if (contenuMedia && Array.isArray(contenuMedia)) {
                    postData.contenuMedia = {
                        create: contenuMedia.map((url) => ({ url }))
                    };
                }
                // If the type is "story", set expireAt to 24 hours from now
                if (type === "story") {
                    const expireAt = new Date();
                    expireAt.setHours(expireAt.getHours() + 24);
                    postData.expireAt = expireAt;
                }
                // Create the post (or story) using Prisma
                const post = yield prisma_1.default.post.create({
                    data: postData,
                });
                // Deduct 1 credit from the user's account
                yield prisma_1.default.user.update({
                    where: { id: userId },
                    data: { credit: { decrement: 1 } },
                });
                // Send the response
                res.status(201).json(post);
            }
            catch (err) {
                console.error(err.message);
                res.status(500).send("Server Error");
            }
        });
    }
    static deleteStoryExpire() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const now = new Date();
                const result = yield prisma_1.default.post.deleteMany({
                    where: {
                        expireAt: {
                            lte: now,
                        },
                    },
                });
                console.log(`Expired stories deleted: ${result.count}`);
            }
            catch (err) {
                console.error("Error deleting expired stories:", err);
            }
        });
    }
    //---------------------------SIGNALE_POST----------------------------------
    static signalPost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { motif, postId } = req.body;
            try {
                if (!motif || !postId) {
                    return res.status(400).send('Veuillez remplir tous les champs');
                }
                // Vérifier si l'utilisateur est connecté (supposons que req.user est défini)
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                console.log(userId);
                if (!userId) {
                    return res.status(404).send("Vous n'êtes pas connecté");
                }
                const user = yield prisma_1.default.user.findUnique({ where: { id: Number(userId) } });
                if (!user) {
                    return res.status(404).send("Utilisateur non trouvé");
                }
                // Vérifier si le post existe
                const post = yield prisma_1.default.post.findUnique({ where: { id: Number(postId) } });
                if (!post) {
                    return res.status(404).send("Post non trouvé");
                }
                // Vérifier si l'utilisateur a déjà signalé le post
                const signalExists = yield prisma_1.default.signale.findFirst({
                    where: { userId: Number(userId), postId: Number(postId) }
                });
                if (signalExists) {
                    return res.status(400).send("Vous avez déjà signalé ce post");
                }
                if (post.expireAt === null) {
                    yield prisma_1.default.signale.create({
                        data: { motif, userId: Number(userId), postId: Number(postId) }
                    });
                    const signalCount = yield prisma_1.default.signale.count({
                        where: { postId: Number(postId) }
                    });
                    if (signalCount > 5) {
                        yield prisma_1.default.post.delete({ where: { id: Number(postId) } });
                        // Ajouter une notification ici si nécessaire
                        return res.json({ message: "Post supprimé en raison de trop de signalements" });
                    }
                    return res.json({ message: "Post signalé avec succès", data: post });
                }
                else {
                    return res.status(400).send("Ce post est expiré et ne peut pas être signalé");
                }
            }
            catch (err) {
                if (typeof err === 'object' && err !== null && 'message' in err) {
                    const errorMessage = err.message;
                    console.error(errorMessage);
                }
                else {
                    console.error('Erreur inconnue');
                }
                return res.status(500).send("Erreur serveur");
            }
        });
    }
    //--------------------------Search_User_Posts------------------------
    static findUserOrPost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { value } = req.body;
            try {
                if (!value) {
                    return res.status(400).json({ message: 'Veuillez entrer une valeur de recherche' });
                }
                const users = yield prisma_1.default.user.findMany({
                    where: {
                        OR: [
                            { nom: { contains: value } },
                            { prenom: { contains: value } }
                        ]
                    }
                });
                const posts = yield prisma_1.default.post.findMany({
                    where: {
                        AND: [
                            { contenu: { contains: value } },
                            { expireAt: null }
                        ]
                    }
                });
                console.log(users, posts);
                if (users.length === 0 && posts.length === 0) {
                    return res.status(404).json({ message: 'Aucun résultat trouvé', Data: null });
                }
                return res.json({
                    message: 'Résultats trouvés',
                    users,
                    posts
                });
            }
            catch (err) {
                if (typeof err === 'object' && err !== null && 'message' in err) {
                    const errorMessage = err.message;
                    console.error(errorMessage);
                }
                else {
                    console.error('Erreur inconnue');
                }
                return res.status(500).send("Erreur serveur");
            }
        });
    }
}
exports.default = PostController;
