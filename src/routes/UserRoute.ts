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
// router.post('/follow',Middleware.verifyToken, UserController.addFollower);
// //lister les followers du user connecté
// router.get('/followers', Middleware.verifyToken,UserController.getFollowers);
// //lister les utilisateurs qui sont followés par le user connecté
// router.get('/followings',Middleware.verifyToken,UserController.getFollowings);
// //achat credit  ça prend  {  amount }
router.post('/achatCredit', Middleware.verifyToken, UserController.rechargerCompte);
// //changer la tailleur  ça prend  rien 
router.post('/modifyProfile', Middleware.verifyToken, UserController.ChangeEnTailleur)
// //ajouter ou enlever favori ça prend { postId }
router.post('/favorite',Middleware.verifyToken, UserController.manageFavorites);
// //lister les favoris du user connecté
router.get('/favorite',Middleware.verifyToken, UserController.getUserFavorites);
// //ajouter ou enlever vote pour un post ça prend  {  voteForUserId }
// router.post('/vote',Middleware.verifyToken, UserController.manageVotes);
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

export default router;      
