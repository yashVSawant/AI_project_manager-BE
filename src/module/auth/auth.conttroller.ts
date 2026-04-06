import { Controller, Post, UseGuards, Req, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Public } from './decorators/public.decorator';
import { AuthService } from './auth.service';

@Public() // ✅ make all routes in this controller public by default
@Controller('auth')
export class AuthController {
  constructor(private readonly userService: AuthService){
    
  }
  
  @Post('login')
  login(@Body() {email , password}:{email:string , password:string}) {
    return this.userService.validateUser(email ,password)
  }
}