import { Controller, Post, UseGuards, Req, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Public } from './decorators/public.decorator';
import { AuthService } from './auth.service';

@Public() // ✅ make all routes in this controller public by default
@Controller('auth')
export class AuthController {
  constructor(private readonly userService: AuthService){}
  
  @Post('login')
  login(@Body() {email , password}:{email:string , password:string} ,@Req() req:any) {
    const user =  this.userService.validateUser(email ,password)
    req.session.user = user;
    return 'Login successfully!'
  }

  @Post('signup')
  signup(@Body() {email,password ,name}:{email:string , password:string , name:string}){
    return this.userService.registerUser(email , password, name)
  }

  @Post('logout')
  logout(@Req() req: any) {
    req.session.destroy(() => {});
    return { message: 'Logged out' };
  }
}