import { Request, Response } from 'express';
import prisma from '../prisma';
interface Comment {
    id: string; // Utilisez 'id' au lieu de '_id' pour Prisma
    text: string;
    commenterId: string;
    updatedAt?: Date;
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




  static async addComment(req: Request, res: Response) {
    const { postId } = req.params;
    const { text } = req.body;
    const commenterId = req.user?.id;

    try {
      if (!commenterId) {
        return res.status(400).send('Commenter ID is missing');
      }

      const post = await prisma.post.findUnique({
        where: { id: postId },
        include: { comments: true }
      });

      if (!post) {
        return res.status(404).send('Post not found');
      }

      if (!text || !text.trim()) {
        return res.status(400).json({ message: "Le texte du commentaire ne peut pas être vide" });
      }

      const updatedPost = await prisma.post.update({
        where: { id: postId },
        data: {
          comments: {
            create: { text, commenterId }
          }
        },
        include: { comments: true }
      });

      res.json(updatedPost.comments);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  }


  static async getComments(req: Request, res: Response) {
    const { postId } = req.params;
    const userId = req.user?.id; // L'ID de l'utilisateur connecté

    try {
      const post = await prisma.post.findUnique({
        where: { id: postId },
        include: {
          comments: {
            include: {
              commenter: {
                select: {
                  nom: true,
                  prenom: true
                }
              }
            }
          }
        }
      });

      if (!post) {
        return res.status(404).send('Post not found');
      }

      res.json({
        connectedUserId: userId,
        comments: post.comments
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  }

  static async deleteComment(req: Request, res: Response) {
    const { postId, commentId } = req.params;

    if (!commentId) {
      return res.status(400).send('Comment ID is missing');
    }

    try {
      const deletedComment = await prisma.comment.delete({
        where: {
          id: commentId,
          postId: postId
        }
      });

      if (!deletedComment) {
        return res.status(404).send('Comment not found');
      }

      res.json({ message: 'Comment deleted' });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  }

  static async updateComment(req: Request, res: Response) {
    const { postId, commentId } = req.params;
    const { text } = req.body;

    if (!commentId) {
      return res.status(400).send('Comment ID is missing');
    }

    try {
      const updatedComment = await prisma.comment.update({
        where: {
          id: commentId,
          postId: postId
        },
        data: {
          text,
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


  static async incrementViews(req: Request, res: Response) {
    const { postId, userId } = req.params;

    if (!userId) {
      return res.status(400).send('User ID is missing');
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return res.status(404).send('User not found');
      }

      const post = await prisma.post.findUnique({
        where: { id: postId },
        include: { viewersIds: true }
      });

      if (!post) {
        return res.status(404).send('Post not found');
      }

      // Utilisez l'interface Viewer pour typer correctement le paramètre 'viewer'
      if (post.viewersIds.some((viewer: Viewer) => viewer.id === userId)) {
        return res.json({ views: post.views });
      }

      const updatedPost = await prisma.post.update({
        where: { id: postId },
        data: {
          views: { increment: 1 },
          viewersIds: { connect: { id: userId } }
        }
      });

      res.json({ views: updatedPost.views });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  }

  static async getViews(req: Request, res: Response) {
    const { postId } = req.params;

    try {
      const post = await prisma.post.findUnique({
        where: { id: postId },
        include: { viewersIds: true }
      }) as PostWithViewers | null;

      if (!post) {
        return res.status(404).send('Post not found');
      }

      res.json({
        views: post.views,
        viewersIds: post.viewersIds.map((viewer: Viewer) => viewer.id)
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  }

  // ... Adaptez les autres méthodes de la même manière ...
}