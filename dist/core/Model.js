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
    findUnique(whereInput) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prismaModel.findUnique({
                where: whereInput
            });
        });
    }
    findMany(whereInput, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prismaModel.findMany(Object.assign({ where: whereInput }, options));
        });
    }
    delete(whereInput) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prismaModel.delete({
                where: whereInput
            });
        });
    }
    update(whereInput, dataInput) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prismaModel.update({
                where: whereInput,
                data: dataInput
            });
        });
    }
    updateMany(whereInput, dataInput) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prismaModel.updateMany({
                where: whereInput,
                data: dataInput
            });
        });
    }
}
exports.default = Model;
