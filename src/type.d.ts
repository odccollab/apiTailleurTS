import { Request } from "express";
// types.d.ts ou validationSchemas.ts
type ValidationSchemaKey = 'register' | 'login' | 'post' | 'comment';
declare module 'express-serve-static-core' {
    interface Request {
      user?: {
        id: string;
        nom: string;
        prenom: string;
        image: string;
        type: string;
      };
    }
  }