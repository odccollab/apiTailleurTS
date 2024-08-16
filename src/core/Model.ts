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
        return this.prismaModel.create( {data} );
    }
    async findUnique(whereInput: any) {
        return this.prismaModel.findUnique({
            where: whereInput
        });
    }
    async findMany(whereInput?: any, options?: any) {
        return this.prismaModel.findMany({
            where: whereInput,
            ...options
        });
    }
    
    async delete(whereInput: any) {
        return this.prismaModel.delete({
            where: whereInput
        });
    }
    
    async update(whereInput: any, dataInput: any) {
        return this.prismaModel.update({
            where: whereInput,
            data: dataInput
        });
    }
    
    async updateMany(whereInput: any, dataInput: any) {
        return this.prismaModel.updateMany({
            where: whereInput,
            data: dataInput
        });
        
    }
    
}
