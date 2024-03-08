import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginCredsDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
