import express, { Router } from 'express';
import UserController from "../controllers/UserController";
import Middleware from '../middlewares/Middleware';

const router:Router = express.Router();

// //create User ça prend { nom, prenom, role, password, telephone, mail,passconfirm }
router.post('/create',Middleware.validateData("register"),  UserController.createUser);
// //avoir profile du user connected
router.get('/profile',Middleware.verifyToken, UserController.profile);
// //login user ça prend { mail, password }
router.post('/login2',Middleware.validateData("login"), UserController.loginUser);
//  //ajouter ou enlever un follower pour un user ça prend  {  followedId }
router.post('/follow',Middleware.verifyToken, UserController.addFollower);
// //lister les followers du user connecté
router.get('/followers', Middleware.verifyToken,UserController.getFollowers);
// //lister les utilisateurs qui sont followés par le user connecté
 router.get('/followings',Middleware.verifyToken,UserController.getFollowings);
// //achat credit  ça prend  {  amount }
router.post('/achatCredit', Middleware.verifyToken, UserController.rechargerCompte);
// //changer la tailleur  ça prend  rien 
router.post('/modifyProfile', Middleware.verifyToken, UserController.ChangeEnTailleur)
// //ajouter ou enlever favori ça prend { postId }
router.post('/favorite',Middleware.verifyToken, UserController.manageFavorites);
// //lister les favoris du user connecté
router.get('/favorite',Middleware.verifyToken, UserController.getUserFavorites);
// //ajouter ou enlever vote pour un post ça prend  {  voteForUserId }
    router.post('/vote',Middleware.verifyToken, UserController.manageVotes);
// //avoir les messages pour le user connecte
router.get('/messages', Middleware.verifyToken, UserController.getMessageUsers);
// //envoyer message  ça prend { receiver, content } 
router.post('/messages', Middleware.verifyToken, UserController.sendMessage);
// //rechercher message  ça prend { searchText, startDate, endDate, senderId }
// router.get('/messages/search', Middleware.verifyToken, UserController.searchMessages);
// router.get('/messages/:userId', Middleware.verifyToken, UserController.getMessagesByUserId);
// avoir les message d'une dicussion avec kl1
router.get('/discussion/:otherUserId', Middleware.verifyToken, UserController.getDiscussion);
// //avoir profile d'un user par id
router.get('/profile/:userId',Middleware.verifyToken, UserController.profile);
//avoir mes notifications
router.get('/notification',Middleware.verifyToken, UserController.getNotif);
//Article 
//ajout article {"idVendeur": 1,  "libelle": "Example Article", "prixUnitaire": 100.50,  "quantiteStock": 20}
router.post('/article',Middleware.verifyToken,Middleware.validateData("article"),Middleware.canPost, UserController.ajoutArticle);
//avoir mes articles
router.get('/article',Middleware.verifyToken, UserController.getArticle);
//modifier article
router.put('/article',Middleware.verifyToken,Middleware.validateData("article"),Middleware.canPost, UserController.updateArticle);
//delete article
router.put('/article',Middleware.verifyToken,Middleware.canPost, UserController.deleteArticle);
//Commandes
//ajouter une commande
router.post('/commande',Middleware.verifyToken,Middleware.validateData("commande"),Middleware.canPost, UserController.createCommande);
// Route pour lister les commandes pour un vendeur
router.get('/commande', Middleware.verifyToken, UserController.orderDuVendeur);
// Route pour valider une commande
router.put('/commande/:orderId', Middleware.verifyToken, Middleware.canValidateOrder, UserController.validateOrder);

// Route pour lister les commandes d'un client
router.get('/commande-c', Middleware.verifyToken, UserController.orderDuClient);
//annuler commande 
router.delete('/commande/:orderId', Middleware.verifyToken, Middleware.canValidateOrder, UserController.cancelOrder);





export default router;      
