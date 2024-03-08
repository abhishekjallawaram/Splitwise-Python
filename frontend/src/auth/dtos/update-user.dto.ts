import { IsBoolean, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export enum Gender {
  Male = 'male',
  Female = 'female',
  Other = 'other',
}

export class UpdateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  middleName: string;

  @IsString()
  lastName: string;

  @IsString()
  phoneNumber: string;

  @IsNotEmpty()
  gender: Gender;

  @IsString()
  academicDetails: string;

  @IsBoolean()
  isActive: boolean;
}
