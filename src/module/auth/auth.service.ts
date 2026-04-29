import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
const saltRound = 10;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) throw new BadRequestException('User not found');

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) throw new BadRequestException('Invalid credentials');

    return user;
  }

  async login(user: any) {
    const payload = { userId: user.id, email: user.email };

    return {
      access_token: this.jwtService.sign(payload, {
        secret: process.env.SECRET_TOKEN_KEY,
        expiresIn: '24h',
      }),
    };
  }

  async registerUser(email: string, password: string, name: string) {
    const salt = await bcrypt.genSalt(saltRound);
    const hashPassword = await bcrypt.hash(password, salt);

   const user = await this.prisma.user.create({
      data: {
        email,
        password: hashPassword,
        name,
      },
    });
    return this.login(user)
  }

  async checkUserExist(email:string){
    const user  = await this.prisma.user.findUnique({
      where:{
        email
      }
    })
    return Boolean(user)
  }
}
