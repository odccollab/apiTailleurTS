"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const SchemaValidation_1 = __importDefault(require("../utils/SchemaValidation"));
class Middleware {
    verifyToken(req, res, next) {
        var _a;
        try {
            console.log("Verifying token...");
            const token = (_a = req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
            if (!token) {
                return res.status(401).json({ error: 'No token provided' });
            }
            const decoded = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY);
            req.user = {
                id: decoded.id,
                nom: decoded.nom,
                prenom: decoded.prenom,
                image: decoded.image
            };
            next();
        }
        catch (error) {
            res.status(401).json({ error: 'Access denied, token is invalid' });
        }
    }
    canPost(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const user = yield User_1.default.findUnique(userId);
                if (!user)
                    return res.status(404).json({ error: 'User not found' });
                if (user.credit < 1) {
                    return res.status(403).json({ error: 'Cannot continue this operation, insufficient credit' });
                }
                next();
            }
            catch (error) {
                res.status(401).json({ error: 'Access denied, token is invalid' });
            }
        });
    }
    validateData(key) {
        return (req, res, next) => {
            const schema = SchemaValidation_1.default[key];
            if (!schema) {
                return res.status(400).json({ error: "No validation schema found for key: " + key });
            }
            const { error } = schema.safeParse(req.body);
            if (error) {
                return res.status(400).json({ error: error.errors[0].message });
            }
            next();
        };
    }
}
exports.default = new Middleware();
