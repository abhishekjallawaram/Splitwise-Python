import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Req,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginCredsDto } from './dtos/login-creds.dto';
import { RegisterDto } from './dtos/auth-register.dto';
import { FacultyRegisterDto } from './dtos/auth-register-faculty.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { ForgotDto, ValidateForgotDto } from './dtos/forgot.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { Role } from './enums/role.enum';
import { AdminRegisterDto } from './dtos/admin-register.dto';
import { Response } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: LoginCredsDto) {
    const { email, password } = loginDto;
    return this.authService.login(email, password);
  }
  @UseGuards(AuthGuard)
  @Post('logout')
  userLogout(@Req() req: Request) {
    return this.authService.logout(req.headers.authorization);
  }

  @Post('forgot')
  forgot(@Body() forgotDto: ForgotDto) {
    return this.authService.forgot(forgotDto);
  }

  @Post('validateForgot')
  validateForgot(@Res() res: Response, @Body() user: ValidateForgotDto) {
    const validatedUser = this.authService.validateForgotPassword(user);
    if (validatedUser) {
      return res.status(HttpStatus.OK).send();
    } else {
      return res.status(HttpStatus.UNAUTHORIZED).send();
    }
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  profile(@Req() req: Request) {
    return this.authService.profile(req['user']);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get()
  findAll() {
    return this.authService.findAll();
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Post('register/student')
  studentRegister(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  // @UseGuards(AuthGuard, RolesGuard)
  // @Roles(Role.Admin)
  @Post('register/admin')
  adminRegister(@Body() adminRegisterDto: AdminRegisterDto) {
    return this.authService.adminRegister(adminRegisterDto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Post('resister/faculty')
  facultyRegister(@Body() facultyRegisterDto: FacultyRegisterDto) {
    return this.authService.facultyRegister(facultyRegisterDto);
  }
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.authService.update(+id, updateUserDto);
  }
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}
