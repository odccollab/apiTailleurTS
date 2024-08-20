import { Request, Response } from 'express';
import prisma from '../prisma';
import { log } from 'console';
import { number } from 'zod';
import UserController from './UserController';
export default class PostController {

    static async createPost(req: Request, res: Response): Promise<void> {
        const { contenu, contenuMedia, type } = req.body;
    
        try {
            const userId = req.user?.id ? parseInt(req.user.id, 10) : null;
    
            if (!userId) {
                res.status(401).send("Unauthorized");
                return;
            }
    
            const user = await prisma.user.findUnique({ where: { id: userId } });
            
            if (!user) {
                res.status(404).send("User not found");
                return;
            }
    
            // Initialize post data
            const postData: any = {
                contenu,
                createdAt: new Date(),
                user: { connect: { id: userId } }
            };
    
            // If contenuMedia is defined and is an array, map over it
            if (contenuMedia && Array.isArray(contenuMedia)) {
                postData.contenuMedia = {
                    create: contenuMedia.map((url: string) => ({ url }))
                };
            }
    
            // If the type is "story", set expireAt to 24 hours from now
            if (type === "story") {
                const expireAt = new Date();
                expireAt.setHours(expireAt.getHours() + 24);
                postData.expireAt = expireAt;
            }
    
            // Create the post (or story) using Prisma
            const post = await prisma.post.create({
                data: postData,
            });
    
            // Deduct 1 credit from the user's account
            await prisma.user.update({
                where: { id: userId },
                data: { credit: { decrement: 1 } },
            });
    
            // Send the response
            res.status(201).json(post);
        } catch (err: any) {
            console.error(err.message);
            res.status(500).send("Server Error");
        }
    }
    
      

    static async deleteStoryExpire(): Promise<void> {
        try {
            const now = new Date();
            const result = await prisma.post.deleteMany({
                where: {
                    expireAt: {
                        lte: now,
                    },
                },
            });
            console.log(`Expired stories deleted: ${result.count}`);
        } catch (err) {
            console.error("Error deleting expired stories:", err);
        }
    }

    //---------------------------SIGNALE_POST----------------------------------
    static async signalPost(req: Request, res: Response): Promise<Response> {
        const { motif, postId } = req.body;
    
        try {
          if (!motif || !postId) {
            return res.status(400).send('Veuillez remplir tous les champs');
          }
    
          // Vérifier si l'utilisateur est connecté (supposons que req.user est défini)
          const userId = req.user?.id;
          
          
          if (!userId) {
            return res.status(404).send("Vous n'êtes pas connecté");
          }
    
          const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    
          if (!user) {
            return res.status(404).send("Utilisateur non trouvé");
          }
    
          // Vérifier si le post existe
          const post = await prisma.post.findUnique({ where: { id: Number(postId) } });
    
    
          if (!post) {
            return res.status(404).send("Post non trouvé");
          }
    
          // Vérifier si l'utilisateur a déjà signalé le post
          const signalExists = await prisma.signale.findFirst({
            where: { userId: Number(userId), postId: Number(postId) }
          });
    
          if (signalExists) {
            return res.status(400).send("Vous avez déjà signalé ce post");
          }
    
           if (post.expireAt === null) {
            await prisma.signale.create({
              data: { motif, userId: Number(userId), postId: Number(postId) }
            });
    
            const signalCount = await prisma.signale.count({
              where: { postId: Number(postId) }
            });
   
            if (signalCount >= 2) {
                await PostController.deleteEntities(Number(postId));
              await prisma.post.delete({ where: { id: Number(postId) } });
              // Ajouter une notification ici si nécessaire
              await UserController.addNotification(Number(userId),"Ce post est supprimé en raison de trop de signalement")
              return res.json({ message: "Post supprimé en raison de trop de signalements" });
            }
    
            return res.json({ message: "Post signalé avec succès" ,data:post});
          } else {
            return res.status(400).send("Ce post est expiré et ne peut pas être signalé");
          }
        }catch (err: unknown) {
          if (typeof err === 'object' && err !== null && 'message' in err) {
            const errorMessage = (err as { message: string }).message;
            console.error(errorMessage);
          } else {
            console.error('Erreur inconnue');
          }
          return res.status(500).send("Erreur serveur");
        }
      }

      //--------------------------Search_User_Posts------------------------
  static async findUserOrPost(req: Request, res: Response): Promise<Response> {
    const { value } = req.body;

    try {
      if (!value) {
        return res.status(400).json({ message: 'Veuillez entrer une valeur de recherche' });
      }

      const users = await prisma.user.findMany({
        where: {
          OR: [
              { nom: { contains: value } },
              { prenom: { contains: value} }
          ]
        }
      });
      
      const posts = await prisma.post.findMany({
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
        users:users,
        posts:posts
      });
    }catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'message' in err) {
        const errorMessage = (err as { message: string }).message;
        console.error(errorMessage);
      } else {
        console.error('Erreur inconnue');
      }
      return res.status(500).send("Erreur serveur");
    }
  }

  //--------------------------------Delete_Entities------------
  static async deleteEntities(postId: number): Promise<void> {
    try {
      // Création des actions de suppression pour les entités liées
      const deleteActions = [
        prisma.signale.deleteMany({ where: { postId } }),
        prisma.comment.deleteMany({ where: { postId } }),
        prisma.likeDislike.deleteMany({ where: { postId } }),
        prisma.media.deleteMany({ where: { postId } }),
        prisma.viewers.deleteMany({ where: { postId } }),
      ];

      // Exécution de toutes les actions de suppression en parallèle
      await Promise.all(deleteActions);
    } catch (error) {
      console.error('Erreur lors de la suppression des entités liées:', error);
      throw new Error('Échec de la suppression des entités liées');
    }
  }

}




