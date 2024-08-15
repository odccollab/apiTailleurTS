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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class Model {
    constructor() {
        const modelName = this.constructor.name.toLowerCase();
        const modelMap = {
            post: prisma.post,
            user: prisma.user,
        };
        this.prismaModel = modelMap[modelName];
        if (!this.prismaModel) {
            throw new Error(`Le modèle pour ${modelName} n'existe pas dans le prsma.`);
        }
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prismaModel.create({ data });
        });
    }
    findUnique(args) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prismaModel.findUnique(args);
        });
    }
    findMany(args) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prismaModel.findMany(args);
        });
    }
    update(args) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prismaModel.update(args);
        });
    }
    delete(args) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prismaModel.delete(args);
        });
    }
}
exports.default = Model;
