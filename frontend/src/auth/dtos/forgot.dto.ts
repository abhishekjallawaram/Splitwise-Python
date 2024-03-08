import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ForgotDto {
  @IsString()
  @IsNotEmpty()
  email: string;
}

export class ValidateForgotDto {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsNumber()
  otp: number;

  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
