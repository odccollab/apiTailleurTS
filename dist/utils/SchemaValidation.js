"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const validationSchemas = {
    // Schéma pour l'enregistrement d'un utilisateur
    register: zod_1.z.object({
        nom: zod_1.z
            .string()
            .min(1, "Le nom ne doit pas être vide")
            .refine((val) => typeof val === "string", {
            message: "Le nom doit être une chaîne de caractères",
        }),
        mail: zod_1.z
            .string()
            .email("L'email doit être valide")
            .min(1, "L'email ne doit pas être vide"),
        prenom: zod_1.z
            .string()
            .min(1, "Le prénom ne doit pas être vide")
            .refine((val) => typeof val === "string", {
            message: "Le prénom doit être une chaîne de caractères",
        }),
        telephone: zod_1.z
            .string()
            .optional()
            .refine((val) => typeof val === "string" || val === undefined, {
            message: "Le numéro de téléphone doit être une chaîne de caractères",
        }),
        type: zod_1.z
            .string()
            .min(1, "Le rôle ne doit pas être vide")
            .refine((val) => ["tailleur", "vendeur", "client"].includes(val), {
            message: "Le rôle doit être une des valeurs suivantes: tailleur, vendeur, client",
        }),
        password: zod_1.z
            .string()
            .min(1, "Le mot de passe ne doit pas être vide")
            .refine((val) => typeof val === "string", {
            message: "Le mot de passe doit être une chaîne de caractères",
        }),
        passconfirm: zod_1.z
            .string()
            .min(1, "La confirmation du mot de passe ne doit pas être vide")
            .refine((val) => typeof val === "string", {
            message: "La confirmation du mot de passe doit être une chaîne de caractères",
        }),
        image: zod_1.z
            .string()
            .min(1, "L'image ne doit pas être vide")
            .regex(/\.(jpg|jpeg|png|gif)$/i, {
            message: "L'image doit être un fichier avec une extension valide (jpg, jpeg, png, gif)",
        }),
    }),
    // Schéma pour la connexion d'un utilisateur
    login: zod_1.z.object({
        mail: zod_1.z
            .string()
            .email("L'email doit être valide")
            .min(1, "L'email ne doit pas être vide"),
        password: zod_1.z
            .string()
            .min(1, "Le mot de passe ne doit pas être vide")
            .refine((val) => typeof val === "string", {
            message: "Le mot de passe doit être une chaîne de caractères",
        }),
    }),
    // Schéma pour la création d'un post
    post: zod_1.z.object({
        contenu: zod_1.z
            .string()
            .min(1, "Le contenu est obligatoire")
            .refine((val) => typeof val === "string", {
            message: "Le contenu doit être une chaîne de caractères",
        }),
        contenuMedia: zod_1.z
            .array(zod_1.z
            .string()
            .url("Les éléments doivent être des URLs valides")
            .regex(/\.(jpeg|jpg|gif|png|mp4|mov)$/i, {
            message: "Le contenu média doit contenir des URLs valides de vidéos ou d'images",
        }))
            .optional()
            .default([]),
    }),
    // Schéma pour les commentaires
    comment: zod_1.z.object({
        text: zod_1.z
            .string()
            .optional()
            .refine((val) => typeof val === "string" || val === undefined, {
            message: "Le texte du commentaire doit être une chaîne de caractères",
        }),
    }),
    // Schéma pour les articles
    article: zod_1.z.object({
        libelle: zod_1.z
            .string()
            .min(1, "Le libellé est obligatoire")
            .refine((val) => typeof val === "string", {
            message: "Le libellé doit être une chaîne de caractères",
        }),
        prixUnitaire: zod_1.z
            .number()
            .positive("Le prix unitaire doit être un nombre positif")
            .refine((val) => typeof val === "number", {
            message: "Le prix unitaire doit être un nombre",
        }),
        quantiteStock: zod_1.z
            .number()
            .int("La quantité en stock doit être un entier")
            .nonnegative("La quantité en stock ne peut pas être négative")
            .refine((val) => typeof val === "number", {
            message: "La quantité en stock doit être un nombre",
        }),
        categorie: zod_1.z
            .string()
            .min(1, "La catégorie est obligatoire")
            .refine((val) => typeof val === "string", {
            message: "La catégorie doit être une chaîne de caractères",
        }),
        description: zod_1.z
            .string()
            .optional()
            .refine((val) => typeof val === "string" || val === undefined, {
            message: "La description doit être une chaîne de caractères",
        }),
    }),
    // Schéma pour les commandes
    commande: zod_1.z.object({
        articles: zod_1.z
            .array(zod_1.z.object({
            idArticle: zod_1.z
                .number()
                .int("L'ID de l'article doit être un entier")
                .positive("L'ID de l'article doit être un nombre positif")
                .refine((val) => typeof val === "number", {
                message: "L'ID de l'article doit être un nombre",
            }),
            quantite: zod_1.z
                .number()
                .int("La quantité doit être un entier")
                .positive("La quantité doit être un nombre positif")
                .refine((val) => typeof val === "number", {
                message: "La quantité doit être un nombre",
            }),
        }))
            .nonempty("La commande doit contenir au moins un article")
            .refine((val) => Array.isArray(val), {
            message: "Les articles doivent être un tableau",
        }),
    }),
};
exports.default = validationSchemas;
