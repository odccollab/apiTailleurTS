import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import UserModel from '../models/User';
import validationSchemas from "../utils/SchemaValidation";
import prisma from "../prisma";

class Middleware {

    public verifyToken(req: Request, res: Response, next: NextFunction) {
        try {
            console.log("Verifying token...");
            const token = req.header("Authorization")?.replace('Bearer ', '');

            if (!token) {
                return res.status(401).json({ error: 'No token provided' });
            }
            
            const decoded = jwt.verify(token, process.env.SECRET_KEY as string) as jwt.JwtPayload;

            req.user = {
                id: decoded.id,
                nom: decoded.nom,
                prenom: decoded.prenom,
                image: decoded.image,
                type: decoded.type
            };

            next();
        } catch (error) {
            res.status(401).json({ error: 'Access denied, token is invalid' });
        }
    }

    public async canPost(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            const user = await UserModel.findUnique({id:userId});

            if (!user) return res.status(404).json({ error: 'User not found' });

            if (user.credit < 1) {
                return res.status(403).json({ error: 'Cannot continue this operation, insufficient credit' });
            }

            next();
        } catch (error) {
            res.status(401).json({ error: 'Access denied, token is invalid' });
        }
    }

    public validateData(key: string) {
        return (req: Request, res: Response, next: NextFunction) => {
            const schema  = validationSchemas[key];

            if (!schema) {
                return res.status(400).json({ error: "No validation schema found for key: " + key });
            }

            const { error } = schema.safeParse(req.body);

            if (error) {
                return res.status(400).json({ error: error.errors });
            }

            next();
        };
    }
    canValidateOrder = async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user?.id;
        const orderId = parseInt(req.params.orderId, 10);
      
        if (!userId || !orderId) {
          return res.status(401).json({ message: "Utilisateur non authentifié ou commande non spécifiée" });
        }
      
        // Vérifiez si la commande appartient au vendeur spécifié
        const order = await prisma.commande.findUnique({
          where: { id: orderId },
          include: { user: true }, // Inclure l'utilisateur (vendeur) pour vérification
        });
        if (!order || order.user.id !== +userId) {
          return res.status(403).json({ message: "Vous n'êtes pas autorisé à valider cette commande" });
        }
      
        next();
      };
}

export default new Middleware();
