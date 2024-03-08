import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '../prisma.service';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PasswordService } from './password.genrate';
import { MemcachedModule } from '../memcached/memcached.module';
import { MemcachedService } from '../memcached/memcached.service';
// import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule,
    ConfigModule,
    JwtModule.register({
      global: true,
      secret: 'JHwihegrf38jk-0=2349,wdmf',
      signOptions: { expiresIn: '365d' },
    }),
    MemcachedModule,
  ],
  providers: [AuthService, PrismaService, PasswordService, MemcachedService],
  controllers: [AuthController],
  exports: [AuthService, PassportModule, JwtModule],
})
export class AuthModule {}
