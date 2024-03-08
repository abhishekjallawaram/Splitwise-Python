import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export enum Gender {
  Male = 'male',
  Female = 'female',
  Other = 'other',
}

export enum EmpList {
  AssistantProfessor = 'Assistant professor',
  Professor = 'Professor',
  AssociateProfessor = 'Associate Professor',
}

export class FacultyRegisterDto {
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
  @IsNotEmpty()
  phoneNumber: string;

  @IsNotEmpty()
  gender: Gender;

  @IsString()
  academicDetails: string;

  @IsNotEmpty()
  employmentType: EmpList;

  @IsString()
  @IsNotEmpty()
  domain: string;

  @IsNumber()
  @IsNotEmpty()
  departmentId: number;
}
