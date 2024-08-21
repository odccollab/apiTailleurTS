import jwt from "jsonwebtoken";
import { Request, Response } from 'express';
import prisma from "../prisma";
import Utils from "../utils/utils";
import UserModel from "../models/User";
import dotenv from "dotenv"
// {
//   "nom":"fallou",
//    "prenom":"sylla",
//     "mail":"fallou53@gmail.com",
//      "password":"passer123",
//      "passconfirm":"passer123",
//       "telephone":"754378671",
//       "type":"Client",
//       "image":"fs.png"
// } 
export default class UserController{
    static async loginUser(req: Request, res: Response): Promise<void> {
        const { mail, password } = req.body;
        try {
          const user = await UserModel.findUnique( { mail: mail } ); 

          if (!user || !Utils.compPass(password, user.password)) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
          }
    
          const SECRET_KEY = process.env.SECRET_KEY;
    
          if (!SECRET_KEY) {
            throw new Error('SECRET_KEY is not defined in the environment variables');
          }
    
          const token = jwt.sign(
            {
              id: user.id,
              type: user.type,
              nom: user.nom,
              prenom: user.prenom,
              image: user.image // Assuming 'i' refers to a photo field, adjust if needed
            },
            SECRET_KEY,
            { expiresIn: '7h' }
          );
    
          res.json({ success: "connected", token });
        } catch (err) {
          console.error(err);
          res.status(500).json('Server Error');
        }
      }
      //-------------------------CREATE_USER------------------------
      static async createUser(req: Request, res: Response): Promise<void> {
        const { nom, prenom, mail, password, passconfirm, telephone, type,image } = req.body;

        // Check if passwords match
        if (password !== passconfirm) {
             res.status(400).json('Les mots de passe ne correspondent pas');
             return
        }
        

        try {
          let user = await prisma.user.findUnique({ where: { mail } });
            if (!user) {
                user = await prisma.user.findUnique({ where: { telephone } });
            }
            if (user) {
                res.status(409).json('Un utilisateur avec cet e-mail ou numéro de téléphone existe déjà.');
                return
            }
            // Set initial credit based on the user type
            let credit = type === "tailleur" ? 10 : 3;

            // Hash the password
            const hashedPassword = Utils.hashPassword(password);

            // Create the user
             user = await prisma.user.create({
                data: {
                    nom,
                    prenom,
                    mail,
                    password: hashedPassword,
                    telephone,
                    type,
                    image,
                    credit
                },
            });

            // json a success response
            res.status(201).json(user);

        } catch (err: any) {
            console.error(err)

            // json a generic server error response
            res.status(500).json('Erreur du serveur');
        }
    }

    //----------------ADD_NOTIFICATION----------------------------
    static async addNotification(userId: number, content: string): Promise<void> {
      try {
        // Crée une nouvelle notification pour l'utilisateur
        await prisma.notification.create({
          data: {
            userId,
            content,
          }
        });
      } catch (err) {
        console.error('Erreur lors de l\'ajout de la notification:', err);
      }
    }
  
      //---------------------------------------VOTE-----------------------------------------
  static async manageVotes(req: Request, res: Response): Promise<Response> {
    const {voteForUserId} = req.body;
    const userId = Number(req.user?.id); // Récupération de l'ID de l'utilisateur depuis le middleware d'authentification

    try {
      // Vérifier l'existence de l'utilisateur à voter
      const userToVote = await prisma.user.findUnique({ where: { id: voteForUserId } });
      if (!userToVote) {
        return res.status(404).send("L'utilisateur n'existe pas");
      }

      // Vérifier que l'utilisateur ne vote pas pour lui-même
      if (userId === voteForUserId) {
        return res.status(400).send("Vous ne pouvez pas voter pour vous-même");
      }

      // Trouver le vote existant
      const existingVote = await prisma.vote.findFirst({
        where: { idVoteur: userId, userId: voteForUserId },
      });

      if (!existingVote) {
        // L'utilisateur n'a pas encore voté, donc on ajoute le vote
        await prisma.vote.create({
          data: {
            idVoteur: userId,
            userId: voteForUserId,
          },
        });
        return res.json({ message: "Vous avez voté pour cet utilisateur" });
      } else {
        // L'utilisateur a déjà voté, donc on supprime le vote
        await prisma.vote.delete({
          where: { id: existingVote.id },
        });
        return res.json({ message: "Vous avez retiré votre vote" });
      }
    } catch (err) {
      console.error((err as Error).message);
      return res.status(500).send('Erreur du serveur');
    }
  }
  //------------------------------------ADD_Follower--------------------------------
  static async addFollower(req: Request, res: Response): Promise<Response> {
    const { followedId } = req.body;
  
    if (!followedId) {
      return res.status(400).send({ error: 'Invalid followedId' });
    }
  
    console.log('followedId:', followedId);
  
    try {
      // Trouver l'utilisateur connecté
      const userConnected = await prisma.user.findUnique({
        where: { id: +req.user?.id! }
      });
  
      const userToFollow = await prisma.user.findUnique({
        where: { id: +followedId },
        include: {
          followers: {
            select: {
              followerId: true // Sélectionne uniquement les IDs des utilisateurs qui suivent cet utilisateur
            }
          }
        }
      });
      
      if (!userConnected) {
        return res.status(404).send("User connected not found");
      }
  
      if (!userToFollow) {
        return res.status(404).send("User to follow not found");
      }
  
      if (followedId === req.user?.id) {
        return res.status(400).send("Vous ne pouvez pas vous suivre vous-même");
      }
  
      // Vérification si l'utilisateur suit déjà
      const alreadyFollowing = await prisma.follower.findFirst({
        where: {
          followerId: userConnected.id,
          userId: +followedId
        }
      });
  
      if (alreadyFollowing) {
        // Arrêter de suivre
        await prisma.follower.delete({
          where: {
            id: alreadyFollowing.id
          }
        });
        return res.status(200).send("Vous avez arrêté de suivre cet utilisateur");
      }
  
      // Ajouter un nouveau follower
      await prisma.follower.create({
        data: {
          followerId: userConnected.id,
          userId: +followedId
        }
      });
  
      return res.json(userToFollow);
    } catch (err) {
      console.error(err);
      return res.status(500).send("Server Error");
    }
  }
  //------------------------------------GET_FOLLOWERS--------------------------------
  static async getFollowers(req: Request, res: Response): Promise<Response> {
    const userConnected = await prisma.user.findUnique({
      where: { id: Number(req.user?.id)},
    });

    if (req.user?.type !== 'tailleur') {
      return res.status(403).json({ message: 'Vous devez être un tailleur pour avoir des followers' });
    }

    if (!userConnected) {
      return res.status(404).send("User connected not found");
    }

    // Récupérer les followers de l'utilisateur connecté
    const followers = await prisma.follower.findMany({
      where: { userId: Number(req.user?.id) },
      include: {
        follower: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            image: true,
          },
        },
      },
    });

    //Formater les données pour la réponse
    const formattedFollowers = followers.map((f:any) => ({
      _id: f.follower.id,
      nom: f.follower.nom,
      prenom: f.follower.prenom,
      image: f.follower.image,
    }));
    if(formattedFollowers.length == 0)
      return res.json({message:"Actuellement, Vous n'avez de  followers",data:[]});
    else
    return res.json({message:"followers trouvés",data:formattedFollowers});
  }

  //------------------GET_Followings-----------------------------
  static async getFollowings(req: Request, res: Response): Promise<Response> {
    try {
      const userConnected = await prisma.user.findUnique({
        where: { id: Number(req.user?.id) },
      });
      console.log(userConnected);
      if (!userConnected) {
        return res.status(404).send("User connected not found");
      }

      // Récupérer les suivis de l'utilisateur connecté à partir de la table Follower
      const followings = await prisma.follower.findMany({
        where: { followerId: userConnected.id },
        include: { user: true },
      });

      // Construire la liste des suivis avec les détails de l'utilisateur
      const followingDetails = followings.map((following:any) => ({
        _id: following.user.id,
        nom: following.user.nom,
        prenom: following.user.prenom,
        image: following.user.image,
      }));
      if(followingDetails.length == 0)
        return res.json({message:"Actuellement, Vous ne suivez personne"});
      else
      return res.json({data:followingDetails});
    } catch (err) {
      console.error((err as Error).message);
      return res.status(500).send('Erreur du serveur');
    }
  }
}

