import bcrypt from 'bcryptjs';
export default class Utils{
    static hashPassword(password:string) {
        return bcrypt.hashSync(password, 10);
    }

    static compPass(password:string, hashedPassword:string) {
        return bcrypt.compareSync(password, hashedPassword);
      }
    
      
}