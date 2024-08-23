import express, { Router } from 'express';
import Middleware from '../middlewares/Middleware';
import  PostController  from '../controllers/PostController';

const router:Router =  express.Router();

// creer un post les variable requis { contenu, contenuMedia }

router.post('/create',Middleware.verifyToken,Middleware.validateData("post"), Middleware.canPost,PostController.createPost);
// //modifier un post les variable requis { contenu, contenuMedia }
router.put('/:postId',Middleware.verifyToken,Middleware.validateData("post"), PostController.modifyPost);
// //recuperer tous les status 
//  router.get('/status', PostController.getAllStatus);
// //delete a post
router.delete('/:id',Middleware.verifyToken, PostController.deletePost);
// //commentaire
// //ajouter un commentaire les variable requis 
// // const { postId, commentId } = req.params;
// //     const { text } = req.body;
// router.post('/:postId/comment', Middleware.verifyToken, validateData('comment'), PostController.addComment);
// //recuperer tous les commentaires d'un post 
// router.get('/:postId/comment', PostController.getComments);
// //modifier un commentaire  
// // const { postId, commentId } = req.params;
// //     const { text } = req.body;
// router.put('/:postId/comment/:commentId',Middleware.validateData('comment'), PostController.updateComment);
// //supprimer un commentaire 
// router.delete('/:postId/comment/:commentId', PostController.deleteComment);
// //story 
// router.post('/createStory',Middleware.verifyToken,Middleware.validateData("post"),Middleware.canPost, PostController.createStory);


// // Nouvelles routes pour les vues 
// router.get('/:postId/view',Middleware.verifyToken, PostController.incrementViews);
// //voilr les vue d'un post 
// router.get('/:postId/views',Middleware.verifyToken, PostController.getViews);
// //file actu 
router.get('/accueil',Middleware.verifyToken,PostController.fileActu)


// //liker dislike
router.get('/:type/:idpost',Middleware.verifyToken, PostController.handleLikeDislike);

// //partage post a un user de l'appli
router.post('/share', PostController.sharePost);
// //partage post a un user via email, facebook, whatsapp
router.post('/share/email', PostController.shareByEmail);
router.post('/share/facebook', PostController.shareOnFacebook);
router.post('/share/whatsapp', PostController.shareOnWhatsApp);
// //signale un use
//  router.post('/signale',Middleware.verifyToken, PostController.signalPost);
//  //recherche utilisateur ou post ça prend  {value}
//  router.get('/find', PostController.findUserOrPost);
 export default router