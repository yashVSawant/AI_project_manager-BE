import { Injectable } from '@nestjs/common';
import { PrismaClient } from 'src/generated/prisma/client';
import { PrismaPlanetScale } from '@prisma/adapter-planetscale';
import { Client } from '@planetscale/database';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    
    const client = new Client({ url: "mysql://root:yash@127.0.0.1:3306/ai_project_maker?allowPublicKeyRetrieval=true&useSSL=false" });
    const adapter = new PrismaPlanetScale(client);
    super({ adapter });
  
  }
  async onModuleInit() {
    console.log("prisma conecting")
    await this.$connect();
    console.log("prisma connected")
  }
}