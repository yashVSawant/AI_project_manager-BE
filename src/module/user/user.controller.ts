import {
  Controller,
  Post,
  UseGuards,
  Req,
  Body,
  Session,
  Get,
} from '@nestjs/common';
import { UserService } from './user.service';


@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

    @Get('me')
    async getUserInfo(@Req() req:any) {
        const userId = req.user.userId;
        return this.userService.getUserInfo(userId);
    }
  
}
