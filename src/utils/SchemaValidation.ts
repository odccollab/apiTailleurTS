import { z } from "zod";

const validationSchemas:any = {
  register: z.object({
    nom: z.string().min(1, "Le nom ne doit pas être vide").refine(
      (val) => typeof val === "string",
      {
        message: "Le nom doit être une chaîne de caractères",
      }
    ),
    mail: z.string().email("L'email doit être valide").min(1, "L'email ne doit pas être vide"),
    prenom: z.string().min(1, "Le prénom ne doit pas être vide").refine(
      (val) => typeof val === "string",
      {
        message: "Le prénom doit être une chaîne de caractères",
      }
    ),
    telephone: z.string().optional().refine(
      (val) => typeof val === "string" || val === undefined,
      {
        message: "Le numéro de téléphone doit être une chaîne de caractères",
      }
    ),
    type: z.string().min(1, "Le rôle ne doit pas être vide").refine(
      (val) => typeof val === "string",
      {
        message: "Le rôle doit être une chaîne de caractères",
      }
    ),
    password: z.string().min(1, "Le mot de passe ne doit pas être vide").refine(
      (val) => typeof val === "string",
      {
        message: "Le mot de passe doit être une chaîne de caractères",
      }
    ),
    passconfirm: z.string().min(1, "La confirmation du mot de passe ne doit pas être vide").refine(
      (val) => typeof val === "string",
      {
        message: "La confirmation du mot de passe doit être une chaîne de caractères",
      }
    ),
    image: z
      .string()
      .min(1, "L'image ne doit pas être vide")
      .regex(/\.(jpg|jpeg|png|gif)$/i, {
        message: "L'image doit être un fichier avec une extension valide (jpg, jpeg, png, gif)",
      }),
  }),
  
  login: z.object({
    mail: z.string().email("L'email doit être valide").min(1, "L'email ne doit pas être vide"),
    password: z.string().min(1, "Le mot de passe ne doit pas être vide").refine(
      (val) => typeof val === "string",
      {
        message: "Le mot de passe doit être une chaîne de caractères",
      }
    ),
  }),

  post: z.object({
    contenu: z.string().min(1, "Le contenu est obligatoire").refine(
      (val) => typeof val === "string",
      {
        message: "Le contenu doit être une chaîne de caractères",
      }
    ),
    contenuMedia: z
      .array(
        z.string().url("Les éléments doivent être des URLs valides").regex(/\.(jpeg|jpg|gif|png|mp4|mov)$/i, {
          message: "Le contenu média doit contenir des URLs valides de vidéos ou d'images",
        })
      )
      .optional()
      .default([]),
  }),

  comment: z.object({
    text: z.string().optional().refine(
      (val) => typeof val === "string" || val === undefined,
      {
        message: "Le texte du commentaire doit être une chaîne de caractères",
      }
    ),
  }),
};

export default validationSchemas;
