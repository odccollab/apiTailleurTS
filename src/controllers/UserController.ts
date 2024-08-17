import jwt from "jsonwebtoken";
import { Request, Response } from 'express';
import prisma from "../prisma";
import Utils from "../utils/utils";
import UserModel from "../models/User";
import dotenv from "dotenv"
// {
//   "nom":"sidy",
//    "prenom":"diop",
//     "mail":"sididiop53@gmail.com",
//      "password":"passer123",
//       "passconfirm":"passer123",
//        "telephone":"784316538",
//         "type":"Tailleur"
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
              role: user.type,
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
      
}