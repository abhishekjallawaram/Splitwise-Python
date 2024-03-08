import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export enum Gender {
  Male = 'male',
  Female = 'female',
  Other = 'other',
}

export class AdminRegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  middleName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  phoneNumber: string;

  @IsNotEmpty()
  gender: Gender;

  @IsString()
  academicDetails: string;
}
