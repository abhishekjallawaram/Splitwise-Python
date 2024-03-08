import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'JHwihegrf38jk-0=2349,wdmf',
    });
  }

  async validate(payload: any) {
    // For the demo, we are returning the payload directly,
    // but in a real app, you would perhaps fetch the user from the database here.
    return { userId: payload.sub };
  }
}
