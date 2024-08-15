import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default class Model {
    private prismaModel: any;

    constructor() {
        const modelName = this.constructor.name.toLowerCase();

        const modelMap: { [key: string]: any } = {
            post: prisma.post,
            user: prisma.user,
        };

        this.prismaModel = modelMap[modelName];

        if (!this.prismaModel) {
            throw new Error(`Le modèle pour ${modelName} n'existe pas dans le prsma.`);
        }
    }

    async create(data: any) {
        return this.prismaModel.create({ data });
    }

    async findUnique(args: any) {
        return this.prismaModel.findUnique(args);
    }

    async findMany(args: any) {
        return this.prismaModel.findMany(args);
    }

    async update(args: any) {
        return this.prismaModel.update(args);
    }

    async delete(args: any) {
        return this.prismaModel.delete(args);
    }
}
