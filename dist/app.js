"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const UserRoute_1 = __importDefault(require("./routes/UserRoute"));
const PostRoute_1 = __importDefault(require("./routes/PostRoute"));
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const PORT = process.env.PORT || 3000;
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/users", UserRoute_1.default);
app.use("/posts", PostRoute_1.default);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// app.post('/createUser', async (req: Request, res: Response) => {
//   const { nom, email, password, prenom, telephone,type } = req.body;
// let credit=3
// const data= {
//     nom,
//     email,
//     password,
//     prenom,
//     telephone,
//     type,
//     credit,
//   }
//   try {
//     const user = await User.create(data);
//     res.status(201).json(user);
//   } catch (err: any) {
//     console.error(err.message);
//     res.status(500).json({ message: 'Server Error' });
//   }
// });
// app.post('/createPost', async (req: Request, res: Response) => {
//     const {  content,title ,state} = req.body;
//     try {
//       const user = await Post.create({
//         data: {
//           content,
//           title,
//           state: state,
//           user: { connect: { id: req.body.userId } }, 
//         },
//       });
//       res.status(201).json(user);
//     } catch (err: any) {
//       console.error(err.message);
//       res.status(500).json({ message: 'Server Error' });
//     }
//   });
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
