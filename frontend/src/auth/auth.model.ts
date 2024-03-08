export class UserEntity {
  id: number;
  firstName: string;
  middleName: string;
  lastName: string;
  password: string;
  email: string;
  phoneNumber: string;
  gender: string;
  academicDetails: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  isAdmin: boolean;
  isStudent: boolean;
  isFaculty: boolean;
}
