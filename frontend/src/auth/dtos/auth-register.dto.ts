import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export enum Gender {
  Male = 'male',
  Female = 'female',
  Other = 'other',
}

export enum CourseList {
  Masters = 'masters',
  Undergrad = 'undergrad',
  Phd = 'phd',
}

export class RegisterDto {
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

  @IsNotEmpty()
  courseType: CourseList;
}
