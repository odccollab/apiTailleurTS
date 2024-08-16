import { Request, Response } from 'express';
import prisma from '../prisma';

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
}
