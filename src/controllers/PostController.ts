import { Request, Response } from 'express';
import prisma from '../prisma';
import nodemailer from 'nodemailer'

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
    
            const postData: any = {
                contenu,
                createdAt: new Date(),
                user: { connect: { id: userId } }
            };
    
            if (contenuMedia && Array.isArray(contenuMedia)) {
                postData.contenuMedia = {
                    create: contenuMedia.map((url: string) => ({ url }))
                };
            }
    
            if (type === "story") {
                const expireAt = new Date();
                expireAt.setHours(expireAt.getHours() + 24);
                postData.expireAt = expireAt;
            }
    
            const post = await prisma.post.create({
                data: postData,
            });
    
            await prisma.user.update({
                where: { id: userId },
                data: { credit: { decrement: 1 } },
            });
    
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
    static async modifyPost(req: Request, res: Response): Promise<Response> {
        try {
            const { postId } = req.params;
            const { contenu, contenuMedia } = req.body;
    
            const post = await prisma.post.findUnique({
                where: { id: Number(postId) },
                include: { contenuMedia: true }, // Inclure les médias associés
            });
            
            if (!post && post!.idUser == +req.user?.id!) {
                return res.status(404).json({ message: 'Post non trouvé' });
            }
    
            const updatedPostData: any = {
                contenu: contenu || post!.contenu,
            };
    
            if (contenuMedia && contenuMedia.length > 0) {
                updatedPostData.contenuMedia = {
                    deleteMany: {}, 
                    create: contenuMedia.map((url: string) => ({ url })), 
                };
            }
    
            const updatedPost = await prisma.post.update({
                where: { id: Number(postId) },
                data: updatedPostData,
            });
            console.log("ici");
            
            return res.status(200).json({ message: 'Post mis à jour avec succès', post: updatedPost });
        } catch (error) {
            return res.status(500).json({ message: 'Erreur lors de la mise à jour du post', error });
        }
    }
    static async deletePost(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        const userId = req.user?.id; // Assure-toi que req.userId est défini par un middleware d'authentification

        // Vérifier si l'ID est un nombre valide
        const postId = Number(id);
        if (isNaN(postId)) {
            return res.status(400).json({ message: "ID is not valid" });
        }

        try {
            // Trouver le post
            const post = await prisma.post.findUnique({
                where: { id: postId },
                select: { idUser: true }, // Sélectionne uniquement le userId pour vérifier la propriété
            });
            
            if (!post) {
                return res.status(404).json({ message: "Post not found" });
            }
            
            if (post.idUser !== +userId!) {
                return res.status(403).json({ message: "You are not authorized to delete this post" });
            }
            console.log(postId);
            
            await prisma.post.delete({
                where: { id: postId }
            });

            return res.json({ message: "Post deleted successfully" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Server Error" });
        }
    }
    static async handleLikeDislike(req: Request, res: Response) {
        const { type, idpost } = req.params;
        const userId = +req.user?.id! ; // Assuming req.id is added by verifyToken middleware
    
        if (!["like", "dislike", "neutre"].includes(type)) {
          return res.status(400).send("Invalid type");
        }
    
        try {
          const post = await prisma.post.findUnique({
            where: { id: parseInt(idpost) },
            include: {
              likeDislike: true,
            },
          });
    
          if (!post) {
            return res.status(404).send("Post not found");
          }
    
          const existingEntry = post.likeDislike.find(
            (entry) => entry.userId === userId
          );
    
          if (existingEntry) {
            if (type === "neutre") {
              // Remove the entry from likeDislike if "neutre"
              await prisma.likeDislike.delete({
                where: { id: existingEntry.id },
              });
            } else {
              // Update the type if it's not "neutre"
              await prisma.likeDislike.update({
                where: { id: existingEntry.id },
                data: { type },
              });
            }
          } else if (type !== "neutre") {
            // Add a new entry if it doesn't exist and the type is not "neutre"
            await prisma.likeDislike.create({
              data: {
                type,
                userId,
                postId: post.id,
              },
            });
          }
    
          // Re-fetch the updated post to send back
          const updatedPost = await prisma.post.findUnique({
            where: { id: parseInt(idpost) },
            include: {
              likeDislike: true,
            },
          });
    
          res.json(updatedPost);
        } catch (err) {
          console.error(err);
          res.status(500).send("Server Error");
        }
      }
    
      static async fileActu(req: Request, res: Response) {
        const userId = +req.user?.id!;
    
        try {
          // Fetch posts that don't expire (i.e., regular posts)
          const posts = await prisma.post.findMany({
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
          const stories = await prisma.post.findMany({
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
    
            if (aSeen && !bSeen) return 1;
            if (!aSeen && bSeen) return -1;
            return 0;
          });
    
          // Separate sorting operation using toSorted
          const sortedStories = stories.toSorted((a, b) => {
            const aSeen = a.viewers.some(viewer => viewer.userId === userId);
            const bSeen = b.viewers.some(viewer => viewer.userId === userId);
    
            if (aSeen && !bSeen) return 1;
            if (!aSeen && bSeen) return -1;
            return 0;
          });
    
          res.json({ posts: sortedPosts, stories: sortedStories });
        } catch (err) {
          console.error(err);
          res.status(500).send("Server Error");
        }
      }
      static async getStoriOrPost(userId: number,type: string): Promise<any> {
        if(type =="story"){
          return await prisma.post.findMany({
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
        }else{
          return await prisma.post.findMany({
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
      }
      static async getPostOrStoryByUser(userId: number, type: string) {
        let whereCondition: any = {
          idUser: userId, // Filtrer par l'utilisateur spécifié
        };
    
        if (type === "story") {
            whereCondition.expireAt = {
                not: null,
            };
        } else {
            whereCondition.expireAt = null;
        }
    
        return await prisma.post.findMany({
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
    }
    static async sharePost(req: Request, res: Response) {
      const { postId, userIds }: { postId: number, userIds: number[] } = req.body;
  
      if (!postId || !userIds.every((id) => id)) {
        return res.status(400).json({ error: "Invalid postId or userIds" });
      }
  
      try {
        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) {
          return res.status(404).json({ error: "Post not found" });
        }
  
        for (const userId of userIds) {
          await prisma.user.update({
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
          let message= `${req.body.prenom} ${req.body.nom} vous a partager un post`
          UserController.addNotification(Number(userId),message)
        }
  
        res.status(200).json({ message: "Post shared successfully" });
      } catch (error) {
        res.status(500).json({ error: error });
      }
    }
    static async shareByEmail(req: Request, res: Response) {
      try {
        const { postId, email }: { postId: string, email: string } = req.body;
        const post = await prisma.post.findUnique({ where: { id: +postId } });
  
        if (!post) {
          return res.status(404).json({ message: "Post non trouvé" });
        }
        let transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER!,
            pass: process.env.EMAIL_PASS!,
          },
        });
  
        let mailOptions = {
          from: process.env.EMAIL_USER!,
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
      } catch (error) {
        res.status(500).json({ error: error });
      }
    }
    static async shareOnFacebook(req: Request, res: Response) {
      try {
        const { postId }: { postId: string } = req.body;
        const post = await prisma.post.findUnique({ where: { id: +postId } });
  
        if (!post) {
          return res.status(404).json({ message: "Post non trouvé" });
        }
  
        const postUrl = `${process.env.BASE_URL}/posts/${postId}`;
        const facebookShareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
  
        res.json({ link: facebookShareLink });
      } catch (error) {
        res.status(500).json({ error: error });
      }
    }
    static async shareOnWhatsApp(req: Request, res: Response) {
      try {
        const { postId }: { postId: string } = req.body;
        const post = await prisma.post.findUnique({ where: { id: +postId } });
  
        if (!post) {
          return res.status(404).json({ message: "Post non trouvé" });
        }
  
        const message = `Découvrez ce post intéressant : ${post.contenu}\nLien: ${process.env.BASE_URL}/post/${postId}`;
        const whatsappShareLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
  
        res.json({ link: whatsappShareLink });
      } catch (error) {
        res.status(500).json({ error: error });
      }
    }
    static async addComment(req: Request, res: Response) {
      const { postId } = req.params;
      const { text } = req.body;
      const userIdString = req.user?.id;
      const post = await prisma.post.findUnique({
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
        const newComment = await prisma.comment.create({
          data: {
            content: text.trim(),
            userId, // Maintenant c'est un nombre
            postId: parseInt(postId, 10)
          }
        });

        res.json(newComment);
      } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
      }
    }



    static async getComments(req: Request, res: Response) {
      const { postId } = req.params;
      const post = await prisma.post.findUnique({
        where: { id: parseInt(postId, 10) },
        include: { viewers: true }
      });

      if (!post) {
        res.status(404).send('Post not found');
        return;
      }
      try {
        const comments = await prisma.comment.findMany({
          where: { postId: parseInt(postId, 10) },
          include: {
            user:{
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
      } catch (err) {
          console.error(err);
          res.status(500).send('Server Error');
      }
  }







      static async updateComment(req: Request, res: Response) {
        const { postId, commentId } = req.params;
        const { content } = req.body; 

        if (!commentId) {
          return res.status(400).send('Comment ID is missing');
        }
        const post = await prisma.post.findUnique({
          where: { id: parseInt(postId, 10) },
          include: { viewers: true }
        });

        if (!post) {
          res.status(404).send('Post not found');
          return;
        }
        try {
          const updatedComment = await prisma.comment.update({
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
        } catch (err) {
          console.error(err);
          res.status(500).send('Server Error');
        }  
      }





      static async deleteComment(req: Request, res: Response): Promise<void> {
        const { postId, commentId } = req.params;

        try {
          // Trouver le post avec les commentaires associés
          const post = await prisma.post.findUnique({
            where: { id: parseInt(postId, 10) },
            include: { comment: true }, // Changé de 'comments' à 'comment'
          });

          if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
          }

          // Vérifier si le commentaire existe
          const comment = await prisma.comment.findUnique({
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
          await prisma.comment.delete({
            where: { id: comment.id },
          });

          res.json({ message: 'Comment deleted' });
        } catch (err) {
          console.error(err);
          res.status(500).json({ message: 'Server Error' });
        }
      }




      static async incrementViews(req: Request, res: Response): Promise<void> {
        const postId = req.params.postId;
        const userId = req.user?.id;

        if (!userId) {
          res.status(400).send('User ID is missing');
          return;
        }

        try {
          // Vérifiez que l'utilisateur existe
          const user = await prisma.user.findUnique({
            where: { id: parseInt(userId, 10) }
          });

          if (!user) {
            res.status(404).send('User not found');
            return;
          }

          // Vérifiez que le post existe
          const post = await prisma.post.findUnique({
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
          const updatedPost = await prisma.post.update({
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
        } catch (err) {
          console.error('Server Error:', err);
          res.status(500).send('Server Error');
        }
      }
      static async getViews(req: Request, res: Response) {
        const { postId } = req.params;

        try {
          const post = await prisma.post.findUnique({
            where: { id: parseInt(postId, 10) },
            include: { viewers: true }
          });

          if (!post) {
            return res.status(404).send('Post not found');
          }

          res.json({
            views: post.viewers.length,
            viewerIds: post.viewers.map((viewer: { id: number }) => viewer.id)
          });
        } catch (err) {
          console.error(err);
          res.status(500).send('Server Error');
        }
      }

  // ... Adaptez les autres méthode

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
  

}
