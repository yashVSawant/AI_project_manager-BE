import { Controller, Post, UseGuards, Req, Body, Session, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Public } from './decorators/public.decorator';
import { AuthService } from './auth.service';
import { loginDto } from './dto/login.dto';
import { signupDto } from './dto/signup.dto';

// @Public() // ✅ make all routes in this controller public by default
@Controller('auth')
export class AuthController {
  constructor(private readonly userService: AuthService){}
  
  @Post('login')
  async login(@Body() {email , password}:loginDto ,@Req() req:any,@Session() session:any) {
    const user = await this.userService.validateUser(email, password);
    return this.userService.login(user);
  }

  @Post('signup')
  signup(@Body() {email,password ,name}:signupDto){
    return this.userService.registerUser(email , password, name)
  }
  
}