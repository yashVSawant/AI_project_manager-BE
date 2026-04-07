import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
const saltRound = 10;

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) throw new BadRequestException('User not found!');

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)  throw new BadRequestException('Incorrect password!');

    // ❗ Never return password
    const { password: _, ...safeUser } = user;

    return safeUser;
  }

  async registerUser(email:string,password:string ,name:string){
    const salt = await bcrypt.genSalt(saltRound);
    const hashPassword = await bcrypt.hash(password ,salt)

    await this.prisma.user.create({
      data:{
        email,
        password:hashPassword,
        name
      }
    })

  }
}