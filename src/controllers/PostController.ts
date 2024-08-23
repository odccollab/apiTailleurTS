import { Request, Response } from 'express';

// Your middleware code here
import prisma from '../prisma';
import { PrismaClient, Post, User } from '@prisma/client';



interface Comment {
  id: string;
  text: string;
  commenterId: string;
  updatedAt?: Date;
}

interface CommentWithCommenter {
  id: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  postId: number;
  commenter: {
    nom: string;
    prenom: string;
  };
}


  
  interface Viewer {
      id: string;
    }
  
  
    interface PostWithViewers {
      id: string;
      views: number;
      viewersIds: Viewer[];
      // ... autres propriétés du post si nécessaire
    }
export default class PostController { 
    static async createPost(req: Request, res: Response): Promise<void> {
        const { contenu, contenuMedia, type } = req.body;
    
        try {
            const userId = req.user?.id ? parseInt(req.user?.id, 10) : null;
    
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



    static async addComment(req: Request, res: Response) {
      const { postId } = req.params;
      const { text } = req.body;
      const userIdString = req.user?.id;
    
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
  
      try {
        const comments = await prisma.comment.findMany({
          where: { postId: parseInt(postId, 10) },
          include: {
            
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
           
      
      // static async incrementViews(req: Request, res: Response): Promise<void> {
      //   // const { postId, userId } = req.params;
      //   const { postId } = req.params;
      //   const userId = req.user?.id;
        
      //   try {
          
      //     // Trouver l'utilisateur
      //     const user = await userId?.findById(userId);
      //     if (!user) {
      //       res.status(404).send('User not found');
      //       return;
      //     }
    
      //     // Trouver le post
      //     const post = await Post.findById(postId);
      //     if (!post) {
      //       res.status(404).send('Post not found');
      //       return;
      //     }
    
      //     // Vérifier si l'utilisateur a déjà visionné le post
      //     if (post.viewersIds.includes(userId)) {
      //       res.json({ views: post.views });
      //       return;
      //     }
    
      //     // Incrémenter le nombre de vues et ajouter l'ID de l'utilisateur
      //     const updatedPost = await Post.findByIdAndUpdate(
      //       postId,
      //       { $inc: { views: 1 }, $addToSet: { viewersIds: userId } },
      //       { new: true }
      //     );
    
      //     if (updatedPost) {
      //       res.json({ views: updatedPost.views });
      //     } else {
      //       res.status(404).send('Post not found');
      //     }
      //   } catch (err) {
      //     console.error(err.message);
      //     res.status(500).send('Server Error');
      //   }
      // }
    
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

  // ... Adaptez les autres méthodes de la même manière ...
}