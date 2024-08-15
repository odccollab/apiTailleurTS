import express, { Express } from 'express';
import { PrismaClient } from '@prisma/client';

import userRoutes from './routes/UserRoute';
import postRoutes from './routes/PostRoute';

const app: Express = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/users",userRoutes)
app.use("/posts",postRoutes)
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
