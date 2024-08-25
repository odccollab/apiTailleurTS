"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const UserController_1 = __importDefault(require("../controllers/UserController"));
const Middleware_1 = __importDefault(require("../middlewares/Middleware"));
const router = express_1.default.Router();
// //create User ça prend { nom, prenom, role, password, telephone, mail,passconfirm }
router.post('/create', Middleware_1.default.validateData("register"), UserController_1.default.createUser);
// //avoir profile du user connected
router.get('/profile', Middleware_1.default.verifyToken, UserController_1.default.profile);
// //login user ça prend { mail, password }
router.post('/login2', Middleware_1.default.validateData("login"), UserController_1.default.loginUser);
//  //ajouter ou enlever un follower pour un user ça prend  {  followedId }
router.post('/follow', Middleware_1.default.verifyToken, UserController_1.default.addFollower);
// //lister les followers du user connecté
router.get('/followers', Middleware_1.default.verifyToken, UserController_1.default.getFollowers);
// //lister les utilisateurs qui sont followés par le user connecté
router.get('/followings', Middleware_1.default.verifyToken, UserController_1.default.getFollowings);
// //achat credit  ça prend  {  amount }
router.post('/achatCredit', Middleware_1.default.verifyToken, UserController_1.default.rechargerCompte);
// //changer la tailleur  ça prend  rien 
router.post('/modifyProfile', Middleware_1.default.verifyToken, UserController_1.default.ChangeEnTailleur);
// //ajouter ou enlever favori ça prend { postId }
router.post('/favorite', Middleware_1.default.verifyToken, UserController_1.default.manageFavorites);
// //lister les favoris du user connecté
router.get('/favorite', Middleware_1.default.verifyToken, UserController_1.default.getUserFavorites);
// //ajouter ou enlever vote pour un post ça prend  {  voteForUserId }
router.post('/vote', Middleware_1.default.verifyToken, UserController_1.default.manageVotes);
// //avoir les messages pour le user connecte
router.get('/messages', Middleware_1.default.verifyToken, UserController_1.default.getMessageUsers);
// //envoyer message  ça prend { receiver, content } 
router.post('/messages', Middleware_1.default.verifyToken, UserController_1.default.sendMessage);
// //rechercher message  ça prend { searchText, startDate, endDate, senderId }
// router.get('/messages/search', Middleware.verifyToken, UserController.searchMessages);
// router.get('/messages/:userId', Middleware.verifyToken, UserController.getMessagesByUserId);
// avoir les message d'une dicussion avec kl1
router.get('/discussion/:otherUserId', Middleware_1.default.verifyToken, UserController_1.default.getDiscussion);
// //avoir profile d'un user par id
router.get('/profile/:userId', Middleware_1.default.verifyToken, UserController_1.default.profile);
//avoir mes notifications
router.get('/notification', Middleware_1.default.verifyToken, UserController_1.default.getNotif);
//Article 
//ajout article {"idVendeur": 1,  "libelle": "Example Article", "prixUnitaire": 100.50,  "quantiteStock": 20}
router.post('/article', Middleware_1.default.verifyToken, Middleware_1.default.validateData("article"), Middleware_1.default.canPost, UserController_1.default.ajoutArticle);
//avoir mes articles
router.get('/article', Middleware_1.default.verifyToken, UserController_1.default.getArticle);
//modifier article
router.put('/article', Middleware_1.default.verifyToken, Middleware_1.default.validateData("article"), Middleware_1.default.canPost, UserController_1.default.updateArticle);
//delete article
router.put('/article', Middleware_1.default.verifyToken, Middleware_1.default.canPost, UserController_1.default.deleteArticle);
//Commandes
//ajouter une commande
router.post('/commande', Middleware_1.default.verifyToken, Middleware_1.default.validateData("commande"), Middleware_1.default.canPost, UserController_1.default.createCommande);
// Route pour lister les commandes pour un vendeur
router.get('/commande', Middleware_1.default.verifyToken, UserController_1.default.orderDuVendeur);
// Route pour valider une commande
router.put('/commande/:orderId', Middleware_1.default.verifyToken, Middleware_1.default.canValidateOrder, UserController_1.default.validateOrder);
// Route pour lister les commandes d'un client
router.get('/commande-c', Middleware_1.default.verifyToken, UserController_1.default.orderDuClient);
//annuler commande 
router.delete('/commande/:orderId', Middleware_1.default.verifyToken, Middleware_1.default.canValidateOrder, UserController_1.default.cancelOrder);
exports.default = router;
