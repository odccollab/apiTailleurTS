"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class Utils {
    static hashPassword(password) {
        return bcryptjs_1.default.hashSync(password, 10);
    }
    static compPass(password, hashedPassword) {
        return bcryptjs_1.default.compareSync(password, hashedPassword);
    }
}
exports.default = Utils;
