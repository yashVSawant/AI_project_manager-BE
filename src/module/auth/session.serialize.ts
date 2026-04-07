import { PassportSerializer } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  serializeUser(user: any, done: Function) {
    done(null, user.id); // store in session
  }

  async deserializeUser(userId: any, done: Function) {
    // Fetch user from DB
    const user = { id: userId, username: 'admin' };
    done(null, user);
  }
}