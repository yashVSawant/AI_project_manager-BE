import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";


@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
  ) {}

    async getUserInfo(userId: string) {
        console.log("Getting user info for userId:", userId ,this.prisma);
        const user = await this.prisma.user.findUnique({    
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
            }
        });
        return user;
        }

}