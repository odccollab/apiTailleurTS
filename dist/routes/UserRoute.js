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
// router.get('/profile',Middleware.verifyToken, UserController.profile);
// //login user ça prend { mail, password }
router.post('/login2', Middleware_1.default.validateData("login"), UserController_1.default.loginUser);
//  //ajouter ou enlever un follower pour un user ça prend  {  followedId }
router.post('/follow', Middleware_1.default.verifyToken, UserController_1.default.addFollower);
// //lister les followers du user connecté
router.get('/followers', Middleware_1.default.verifyToken, UserController_1.default.getFollowers);
// //lister les utilisateurs qui sont followés par le user connecté
router.get('/followings', Middleware_1.default.verifyToken, UserController_1.default.getFollowings);
// //achat credit  ça prend  {  amount }
// router.post('/achatCredit', Middleware.verifyToken, UserController.rechargerCompte);
// //changer la tailleur  ça prend  rien 
// router.post('/modifyProfile', Middleware.verifyToken, UserController.ChangeEnTailleur)
// //ajouter ou enlever favori ça prend { postId }
// router.post('/favorite',Middleware.verifyToken, UserController.manageFavorites);
// //lister les favoris du user connecté
// router.get('/favorite',Middleware.verifyToken, UserController.getUserFavorites);
// //ajouter ou enlever vote pour un post ça prend  {  voteForUserId }
router.post('/vote', Middleware_1.default.verifyToken, UserController_1.default.manageVotes);
// //avoir les messages pour le user connecte
// router.get('/messages', Middleware.verifyToken, UserController.getMessages);
// //envoyer message  ça prend { receiver, content } 
// router.post('/messages', Middleware.verifyToken, UserController.sendMessage);
// //rechercher message  ça prend { searchText, startDate, endDate, senderId }
// router.get('/messages/search', Middleware.verifyToken, UserController.searchMessages);
// router.get('/messages/:userId', Middleware.verifyToken, UserController.getMessagesByUserId);
exports.default = router;
