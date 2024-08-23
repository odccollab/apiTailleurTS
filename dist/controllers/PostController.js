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
const nodemailer_1 = __importDefault(require("nodemailer"));
const UserController_1 = __importDefault(require("./UserController"));
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
                const postData = {
                    contenu,
                    createdAt: new Date(),
                    user: { connect: { id: userId } }
                };
                if (contenuMedia && Array.isArray(contenuMedia)) {
                    postData.contenuMedia = {
                        create: contenuMedia.map((url) => ({ url }))
                    };
                }
                if (type === "story") {
                    const expireAt = new Date();
                    expireAt.setHours(expireAt.getHours() + 24);
                    postData.expireAt = expireAt;
                }
                const post = yield prisma_1.default.post.create({
                    data: postData,
                });
                yield prisma_1.default.user.update({
                    where: { id: userId },
                    data: { credit: { decrement: 1 } },
                });
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
    static modifyPost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { postId } = req.params;
                const { contenu, contenuMedia } = req.body;
                const post = yield prisma_1.default.post.findUnique({
                    where: { id: Number(postId) },
                    include: { contenuMedia: true }, // Inclure les médias associés
                });
                if (!post && post.idUser == +((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
                    return res.status(404).json({ message: 'Post non trouvé' });
                }
                const updatedPostData = {
                    contenu: contenu || post.contenu,
                };
                if (contenuMedia && contenuMedia.length > 0) {
                    updatedPostData.contenuMedia = {
                        deleteMany: {},
                        create: contenuMedia.map((url) => ({ url })),
                    };
                }
                const updatedPost = yield prisma_1.default.post.update({
                    where: { id: Number(postId) },
                    data: updatedPostData,
                });
                console.log("ici");
                return res.status(200).json({ message: 'Post mis à jour avec succès', post: updatedPost });
            }
            catch (error) {
                return res.status(500).json({ message: 'Erreur lors de la mise à jour du post', error });
            }
        });
    }
    static deletePost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { id } = req.params;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Assure-toi que req.userId est défini par un middleware d'authentification
            // Vérifier si l'ID est un nombre valide
            const postId = Number(id);
            if (isNaN(postId)) {
                return res.status(400).json({ message: "ID is not valid" });
            }
            try {
                // Trouver le post
                const post = yield prisma_1.default.post.findUnique({
                    where: { id: postId },
                    select: { idUser: true }, // Sélectionne uniquement le userId pour vérifier la propriété
                });
                if (!post) {
                    return res.status(404).json({ message: "Post not found" });
                }
                if (post.idUser !== +userId) {
                    return res.status(403).json({ message: "You are not authorized to delete this post" });
                }
                console.log(postId);
                yield prisma_1.default.post.delete({
                    where: { id: postId }
                });
                return res.json({ message: "Post deleted successfully" });
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server Error" });
            }
        });
    }
    static handleLikeDislike(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { type, idpost } = req.params;
            const userId = +((_a = req.user) === null || _a === void 0 ? void 0 : _a.id); // Assuming req.id is added by verifyToken middleware
            if (!["like", "dislike", "neutre"].includes(type)) {
                return res.status(400).send("Invalid type");
            }
            try {
                const post = yield prisma_1.default.post.findUnique({
                    where: { id: parseInt(idpost) },
                    include: {
                        likeDislike: true,
                    },
                });
                if (!post) {
                    return res.status(404).send("Post not found");
                }
                const existingEntry = post.likeDislike.find((entry) => entry.userId === userId);
                if (existingEntry) {
                    if (type === "neutre") {
                        // Remove the entry from likeDislike if "neutre"
                        yield prisma_1.default.likeDislike.delete({
                            where: { id: existingEntry.id },
                        });
                    }
                    else {
                        // Update the type if it's not "neutre"
                        yield prisma_1.default.likeDislike.update({
                            where: { id: existingEntry.id },
                            data: { type },
                        });
                    }
                }
                else if (type !== "neutre") {
                    // Add a new entry if it doesn't exist and the type is not "neutre"
                    yield prisma_1.default.likeDislike.create({
                        data: {
                            type,
                            userId,
                            postId: post.id,
                        },
                    });
                }
                // Re-fetch the updated post to send back
                const updatedPost = yield prisma_1.default.post.findUnique({
                    where: { id: parseInt(idpost) },
                    include: {
                        likeDislike: true,
                    },
                });
                res.json(updatedPost);
            }
            catch (err) {
                console.error(err);
                res.status(500).send("Server Error");
            }
        });
    }
    static fileActu(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = +((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
            try {
                // Fetch posts that don't expire (i.e., regular posts)
                const posts = yield prisma_1.default.post.findMany({
                    where: {
                        expireAt: null,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    include: {
                        user: {
                            select: {
                                nom: true,
                                prenom: true,
                                image: true,
                            },
                        },
                        viewers: {
                            select: {
                                userId: true,
                            },
                        },
                    },
                });
                // Fetch stories (posts that expire)
                const stories = yield prisma_1.default.post.findMany({
                    where: {
                        expireAt: {
                            not: null,
                        },
                    },
                    orderBy: {
                        expireAt: 'desc',
                    },
                    include: {
                        user: {
                            select: {
                                nom: true,
                                prenom: true,
                                image: true,
                            },
                        },
                        viewers: {
                            select: {
                                userId: true,
                            },
                        },
                    },
                });
                if (!userId) {
                    return res.json({ posts, stories });
                }
                // Separate sorting operation using toSorted
                const sortedPosts = posts.toSorted((a, b) => {
                    const aSeen = a.viewers.some(viewer => viewer.userId === userId);
                    const bSeen = b.viewers.some(viewer => viewer.userId === userId);
                    if (aSeen && !bSeen)
                        return 1;
                    if (!aSeen && bSeen)
                        return -1;
                    return 0;
                });
                // Separate sorting operation using toSorted
                const sortedStories = stories.toSorted((a, b) => {
                    const aSeen = a.viewers.some(viewer => viewer.userId === userId);
                    const bSeen = b.viewers.some(viewer => viewer.userId === userId);
                    if (aSeen && !bSeen)
                        return 1;
                    if (!aSeen && bSeen)
                        return -1;
                    return 0;
                });
                res.json({ posts: sortedPosts, stories: sortedStories });
            }
            catch (err) {
                console.error(err);
                res.status(500).send("Server Error");
            }
        });
    }
    static getStoriOrPost(userId, type) {
        return __awaiter(this, void 0, void 0, function* () {
            if (type == "story") {
                return yield prisma_1.default.post.findMany({
                    where: {
                        expireAt: {
                            not: null,
                        },
                    },
                    orderBy: {
                        expireAt: 'desc',
                    },
                    include: {
                        user: {
                            select: {
                                nom: true,
                                prenom: true,
                                image: true,
                            },
                        },
                        viewers: {
                            select: {
                                userId: true,
                            },
                        },
                    },
                });
            }
            else {
                return yield prisma_1.default.post.findMany({
                    where: {
                        expireAt: null,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    include: {
                        user: {
                            select: {
                                nom: true,
                                prenom: true,
                                image: true,
                            },
                        },
                        viewers: {
                            select: {
                                userId: true,
                            },
                        },
                    },
                });
            }
        });
    }
    static getPostOrStoryByUser(userId, type) {
        return __awaiter(this, void 0, void 0, function* () {
            let whereCondition = {
                idUser: userId, // Filtrer par l'utilisateur spécifié
            };
            if (type === "story") {
                whereCondition.expireAt = {
                    not: null,
                };
            }
            else {
                whereCondition.expireAt = null;
            }
            return yield prisma_1.default.post.findMany({
                where: whereCondition,
                orderBy: {
                    expireAt: type === "story" ? 'desc' : undefined,
                    createdAt: type === "post" ? 'desc' : undefined,
                },
                include: {
                    user: {
                        select: {
                            nom: true,
                            prenom: true,
                            image: true,
                        },
                    },
                    viewers: {
                        select: {
                            userId: true,
                        },
                    },
                },
            });
        });
    }
    static sharePost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { postId, userIds } = req.body;
            if (!postId || !userIds.every((id) => id)) {
                return res.status(400).json({ error: "Invalid postId or userIds" });
            }
            try {
                const post = yield prisma_1.default.post.findUnique({ where: { id: postId } });
                if (!post) {
                    return res.status(404).json({ error: "Post not found" });
                }
                for (const userId of userIds) {
                    yield prisma_1.default.user.update({
                        where: { id: userId },
                        data: {
                            sharedPosts: {
                                connect: { id: postId },
                            },
                        },
                    });
                    // await prisma.notification.create({
                    //   data: {
                    //     userId,
                    //     type: "story",
                    //     
                    //   },
                    // });
                    let message = `${req.body.prenom} ${req.body.nom} vous a partager un post`;
                    UserController_1.default.addNotification(Number(userId), message);
                }
                res.status(200).json({ message: "Post shared successfully" });
            }
            catch (error) {
                res.status(500).json({ error: error });
            }
        });
    }
    static shareByEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { postId, email } = req.body;
                const post = yield prisma_1.default.post.findUnique({ where: { id: +postId } });
                if (!post) {
                    return res.status(404).json({ message: "Post non trouvé" });
                }
                let transporter = nodemailer_1.default.createTransport({
                    service: "gmail",
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS,
                    },
                });
                let mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: email,
                    subject: `Découvrez ce post !`,
                    text: `Je trouve ce post intéressant, jetez un œil : ${post.contenu}\nLien: ${process.env.BASE_URL}/posts/${postId}`,
                };
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return res.status(500).json({ error: error.message });
                    }
                    res.status(200).json({ message: "E-mail envoyé avec succès" });
                });
            }
            catch (error) {
                res.status(500).json({ error: error });
            }
        });
    }
    static shareOnFacebook(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { postId } = req.body;
                const post = yield prisma_1.default.post.findUnique({ where: { id: +postId } });
                if (!post) {
                    return res.status(404).json({ message: "Post non trouvé" });
                }
                const postUrl = `${process.env.BASE_URL}/posts/${postId}`;
                const facebookShareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
                res.json({ link: facebookShareLink });
            }
            catch (error) {
                res.status(500).json({ error: error });
            }
        });
    }
    static shareOnWhatsApp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { postId } = req.body;
                const post = yield prisma_1.default.post.findUnique({ where: { id: +postId } });
                if (!post) {
                    return res.status(404).json({ message: "Post non trouvé" });
                }
                const message = `Découvrez ce post intéressant : ${post.contenu}\nLien: ${process.env.BASE_URL}/post/${postId}`;
                const whatsappShareLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
                res.json({ link: whatsappShareLink });
            }
            catch (error) {
                res.status(500).json({ error: error });
            }
        });
    }
    static addComment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { postId } = req.params;
            const { text } = req.body;
            const userIdString = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const post = yield prisma_1.default.post.findUnique({
                where: { id: parseInt(postId, 10) },
                include: { viewers: true }
            });
            if (!post) {
                res.status(404).send('Post not found');
                return;
            }
            if (!userIdString) {
                return res.status(400).send('User ID is missing');
            }
            const userId = parseInt(userIdString, 10);
            if (isNaN(userId)) {
                return res.status(400).send('Invalid User ID');
            }
            try {
                if (!text || !text.trim()) {
                    return res.status(400).json({ message: "Le texte du commentaire ne peut pas être vide" });
                }
                // Création du nouveau commentaire
                const newComment = yield prisma_1.default.comment.create({
                    data: {
                        content: text.trim(),
                        userId, // Maintenant c'est un nombre
                        postId: parseInt(postId, 10)
                    }
                });
                res.json(newComment);
            }
            catch (err) {
                console.error(err);
                res.status(500).send('Server Error');
            }
        });
    }
    static getComments(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { postId } = req.params;
            const post = yield prisma_1.default.post.findUnique({
                where: { id: parseInt(postId, 10) },
                include: { viewers: true }
            });
            if (!post) {
                res.status(404).send('Post not found');
                return;
            }
            try {
                const comments = yield prisma_1.default.comment.findMany({
                    where: { postId: parseInt(postId, 10) },
                    include: {
                        user: {
                            select: {
                                id: true,
                                nom: true,
                                prenom: true,
                                image: true
                            }
                        }
                    },
                });
                if (!comments.length) {
                    return res.status(404).send('No comments found for this post');
                }
                res.json(comments);
            }
            catch (err) {
                console.error(err);
                res.status(500).send('Server Error');
            }
        });
    }
    static updateComment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { postId, commentId } = req.params;
            const { content } = req.body;
            if (!commentId) {
                return res.status(400).send('Comment ID is missing');
            }
            const post = yield prisma_1.default.post.findUnique({
                where: { id: parseInt(postId, 10) },
                include: { viewers: true }
            });
            if (!post) {
                res.status(404).send('Post not found');
                return;
            }
            try {
                const updatedComment = yield prisma_1.default.comment.update({
                    where: {
                        id: parseInt(commentId, 10), // Convertir commentId en nombre
                        postId: parseInt(postId, 10) // Convertir postId en nombre
                    },
                    data: {
                        content,
                        updatedAt: new Date()
                    }
                });
                if (!updatedComment) {
                    return res.status(404).send('Comment not found');
                }
                res.json(updatedComment);
            }
            catch (err) {
                console.error(err);
                res.status(500).send('Server Error');
            }
        });
    }
    static deleteComment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { postId, commentId } = req.params;
            try {
                // Trouver le post avec les commentaires associés
                const post = yield prisma_1.default.post.findUnique({
                    where: { id: parseInt(postId, 10) },
                    include: { comment: true }, // Changé de 'comments' à 'comment'
                });
                if (!post) {
                    res.status(404).json({ message: 'Post not found' });
                    return;
                }
                // Vérifier si le commentaire existe
                const comment = yield prisma_1.default.comment.findUnique({
                    where: {
                        id: parseInt(commentId, 10),
                        postId: parseInt(postId, 10)
                    },
                });
                if (!comment) {
                    res.status(404).json({ message: 'Comment not found' });
                    return;
                }
                // Supprimer le commentaire
                yield prisma_1.default.comment.delete({
                    where: { id: comment.id },
                });
                res.json({ message: 'Comment deleted' });
            }
            catch (err) {
                console.error(err);
                res.status(500).json({ message: 'Server Error' });
            }
        });
    }
    static incrementViews(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const postId = req.params.postId;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                res.status(400).send('User ID is missing');
                return;
            }
            try {
                // Vérifiez que l'utilisateur existe
                const user = yield prisma_1.default.user.findUnique({
                    where: { id: parseInt(userId, 10) }
                });
                if (!user) {
                    res.status(404).send('User not found');
                    return;
                }
                // Vérifiez que le post existe
                const post = yield prisma_1.default.post.findUnique({
                    where: { id: parseInt(postId, 10) },
                    include: { viewers: true }
                });
                if (!post) {
                    res.status(404).send('Post not found');
                    return;
                }
                // Vérifiez si l'utilisateur a déjà vu le post
                const viewerExists = post.viewers.some(viewer => viewer.userId === parseInt(userId, 10));
                if (viewerExists) {
                    // Si l'utilisateur a déjà vu le post, renvoyez le nombre de vues
                    res.json({ views: post.viewers.length });
                    return;
                }
                // Ajoutez l'utilisateur comme vue du post
                const updatedPost = yield prisma_1.default.post.update({
                    where: { id: parseInt(postId, 10) },
                    data: {
                        viewers: {
                            create: { userId: parseInt(userId, 10) }
                        }
                    },
                    include: { viewers: true }
                });
                // Répondez avec le nombre de vues mises à jour
                res.json({ views: updatedPost.viewers.length });
            }
            catch (err) {
                console.error('Server Error:', err);
                res.status(500).send('Server Error');
            }
        });
    }
    static getViews(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { postId } = req.params;
            try {
                const post = yield prisma_1.default.post.findUnique({
                    where: { id: parseInt(postId, 10) },
                    include: { viewers: true }
                });
                if (!post) {
                    return res.status(404).send('Post not found');
                }
                res.json({
                    views: post.viewers.length,
                    viewerIds: post.viewers.map((viewer) => viewer.id)
                });
            }
            catch (err) {
                console.error(err);
                res.status(500).send('Server Error');
            }
        });
    }
    // ... Adaptez les autres méthode
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
                    if (signalCount >= 2) {
                        yield prisma_1.default.post.delete({ where: { id: Number(postId) } });
                        // Ajouter une notification ici si nécessaire
                        yield UserController_1.default.addNotification(Number(userId), "Ce post est supprimé en raison de trop de signalement");
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
                if (users.length === 0 && posts.length === 0) {
                    return res.status(404).json({ message: 'Aucun résultat trouvé', Data: null });
                }
                return res.json({
                    message: 'Résultats trouvés',
                    users: users,
                    posts: posts
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
