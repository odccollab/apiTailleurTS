"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const validationSchemas = {
    register: zod_1.z.object({
        nom: zod_1.z.string().min(1, "Le nom ne doit pas être vide").refine((val) => typeof val === "string", {
            message: "Le nom doit être une chaîne de caractères",
        }),
        mail: zod_1.z.string().email("L'email doit être valide").min(1, "L'email ne doit pas être vide"),
        prenom: zod_1.z.string().min(1, "Le prénom ne doit pas être vide").refine((val) => typeof val === "string", {
            message: "Le prénom doit être une chaîne de caractères",
        }),
        telephone: zod_1.z.string().optional().refine((val) => typeof val === "string" || val === undefined, {
            message: "Le numéro de téléphone doit être une chaîne de caractères",
        }),
        type: zod_1.z.string().min(1, "Le rôle ne doit pas être vide").refine((val) => typeof val === "string", {
            message: "Le rôle doit être une chaîne de caractères",
        }),
        password: zod_1.z.string().min(1, "Le mot de passe ne doit pas être vide").refine((val) => typeof val === "string", {
            message: "Le mot de passe doit être une chaîne de caractères",
        }),
        passconfirm: zod_1.z.string().min(1, "La confirmation du mot de passe ne doit pas être vide").refine((val) => typeof val === "string", {
            message: "La confirmation du mot de passe doit être une chaîne de caractères",
        }),
        image: zod_1.z
            .string()
            .min(1, "L'image ne doit pas être vide")
            .regex(/\.(jpg|jpeg|png|gif)$/i, {
            message: "L'image doit être un fichier avec une extension valide (jpg, jpeg, png, gif)",
        }),
    }),
    login: zod_1.z.object({
        mail: zod_1.z.string().email("L'email doit être valide").min(1, "L'email ne doit pas être vide"),
        password: zod_1.z.string().min(1, "Le mot de passe ne doit pas être vide").refine((val) => typeof val === "string", {
            message: "Le mot de passe doit être une chaîne de caractères",
        }),
    }),
    post: zod_1.z.object({
        contenu: zod_1.z.string().min(1, "Le contenu est obligatoire").refine((val) => typeof val === "string", {
            message: "Le contenu doit être une chaîne de caractères",
        }),
        contenuMedia: zod_1.z
            .array(zod_1.z.string().url("Les éléments doivent être des URLs valides").regex(/\.(jpeg|jpg|gif|png|mp4|mov)$/i, {
            message: "Le contenu média doit contenir des URLs valides de vidéos ou d'images",
        }))
            .optional()
            .default([]),
    }),
    comment: zod_1.z.object({
        text: zod_1.z.string().optional().refine((val) => typeof val === "string" || val === undefined, {
            message: "Le texte du commentaire doit être une chaîne de caractères",
        }),
    }),
};
exports.default = validationSchemas;
