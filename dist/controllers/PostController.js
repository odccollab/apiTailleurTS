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
const prisma_1 = __importDefault(require("../prisma"));
class PostController {
    static createPost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { contenu, contenuMedia, type } = req.body;
            try {
                const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) ? parseInt(req.user.id, 10) : null;
                if (!userId) {
                    res.status(401).send("Unauthorized");
                    return;
                }
                const user = yield prisma_1.default.user.findUnique({ where: { id: userId } });
                if (!user) {
                    res.status(404).send("User not found");
                    return;
                }
                // Initialize post data
                const postData = {
                    contenu,
                    createdAt: new Date(),
                    user: { connect: { id: userId } }
                };
                // If contenuMedia is defined and is an array, map over it
                if (contenuMedia && Array.isArray(contenuMedia)) {
                    postData.contenuMedia = {
                        create: contenuMedia.map((url) => ({ url }))
                    };
                }
                // If the type is "story", set expireAt to 24 hours from now
                if (type === "story") {
                    const expireAt = new Date();
                    expireAt.setHours(expireAt.getHours() + 24);
                    postData.expireAt = expireAt;
                }
                // Create the post (or story) using Prisma
                const post = yield prisma_1.default.post.create({
                    data: postData,
                });
                // Deduct 1 credit from the user's account
                yield prisma_1.default.user.update({
                    where: { id: userId },
                    data: { credit: { decrement: 1 } },
                });
                // Send the response
                res.status(201).json(post);
            }
            catch (err) {
                console.error(err.message);
                res.status(500).send("Server Error");
            }
        });
    }
    static deleteStoryExpire() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const now = new Date();
                const result = yield prisma_1.default.post.deleteMany({
                    where: {
                        expireAt: {
                            lte: now,
                        },
                    },
                });
                console.log(`Expired stories deleted: ${result.count}`);
            }
            catch (err) {
                console.error("Error deleting expired stories:", err);
            }
        });
    }
}
exports.default = PostController;
