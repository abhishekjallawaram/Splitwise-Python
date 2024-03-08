import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthEntityDto } from './dtos/auth-entity.dto';
import { RegisterDto } from './dtos/auth-register.dto';
import { FacultyRegisterDto } from './dtos/auth-register-faculty.dto';
import { LoginDto } from './dtos/auth-entity-login.dto';
import { PasswordService } from './password.genrate';
import { ForgotDto, ValidateForgotDto } from './dtos/forgot.dto';
import { UserEntity } from './auth.model';
import { UpdateUserDto } from './dtos/update-user.dto';
import { AdminRegisterDto } from './dtos/admin-register.dto';
import { sendEmail } from './utils/auth.email.utils';
import { MemcachedService } from '../memcached/memcached.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private passwordGenerator: PasswordService,
    private memcachedService: MemcachedService,
  ) {}
  async isStudentIdUnique(studentId: string): Promise<boolean> {
    const existingStudent = await this.prisma.studentProfile.findFirst({
      where: {
        collegeId: studentId,
      },
    });
    return !existingStudent;
  }

  async generateStudentId(firstName, lastName): Promise<string> {
    const normalizedFirstName = firstName.charAt(0).toLowerCase();
    const normalizedLastName = lastName.replace(/\s+/g, '').toLowerCase();

    let studentId = `${normalizedFirstName}${normalizedLastName}`;

    let isUnique = await this.isStudentIdUnique(studentId);

    let count = 1;
    while (!isUnique) {
      studentId = `${normalizedFirstName}${normalizedLastName}${count}`;
      isUnique = await this.isStudentIdUnique(studentId);
      count++;
    }

    return studentId;
  }

  async logout(userToken: string) {
    const token = userToken.split('Bearer ')[1];
    const decodedToken = this.jwtService.decode(token);
    if (!decodedToken || typeof decodedToken === 'string') {
      throw new UnauthorizedException('Invalid token.');
    }
    const expirationDate = new Date(decodedToken.exp * 1000);
    // check if the token already exists
    const tokenAlreadyExists = await this.prisma.blacklistedToken.findUnique({
      where: {
        token: token,
      },
    });

    if (tokenAlreadyExists) {
      throw new ConflictException('You have already logged out.');
    }

    await this.prisma.blacklistedToken.create({
      data: {
        token: token,
        expiresAt: expirationDate,
      },
    });
    return { message: 'Successfully logged out.' };
  }

  async forgot(forgotDto: ForgotDto) {
    const { email } = forgotDto;

    const existingUser = await this.prisma.customUser.findUnique({
      where: { email: email },
    });
    if (existingUser) {
      const min = 100000;
      const max = 999999;
      const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
      const userEmail = existingUser.email;

      await this.memcachedService.set(userEmail, randomNumber, 0);
      await sendEmail(email, 'OTP', `Your OTP: ${randomNumber}`);
    } else {
      throw new ConflictException('Invalid email.');
    }
  }

  async validateForgotPassword(creds: ValidateForgotDto) {
    const { email, otp, newPassword } = creds;
    const otpCached = await this.memcachedService.get(email);

    if (otpCached === otp) {
      this.prisma.customUser.update({
        where: { email },
        data: {
          password: await bcrypt.hash(newPassword, 10),
        },
      });
      return true;
    } else {
      throw new UnauthorizedException('Invalid OTP');
    }
  }

  async findAll() {
    return this.prisma.customUser.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
      },
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.customUser.findUnique({
      where: { id },
      include: {
        studentProfiles: true, // Include student profile
        facultyProfiles: true, // Include faculty profile
      },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid user Id');
    }
    let role = '';
    if (user.isAdmin) {
      role = 'admin';
    } else if (user.isFaculty) {
      role = 'faculty';
    } else {
      role = 'student';
    }
    if (role == 'admin') {
      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        middleName: user.middleName,
        phoneNumber: user.phoneNumber,
        gender: user.gender,
        academicDetails: user.academicDetails,
        role: role,
      };
    }
    if (role == 'student') {
      const student = user.studentProfiles[0];
      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        middleName: user.middleName,
        phoneNumber: user.phoneNumber,
        gender: user.gender,
        academicDetails: user.academicDetails,
        role: role,
        collegeId: student.collegeId,
        enrollmentYear: student.enrollmentYear,
        credits: student.credits,
        courseType: student.courseType,
      };
    }
    if (role == 'faculty') {
      const faculty = user.facultyProfiles[0];
      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        middleName: user.middleName,
        phoneNumber: user.phoneNumber,
        gender: user.gender,
        academicDetails: user.academicDetails,
        role: role,
        employmentType: faculty.employmentType,
        domain: faculty.domain,
        employmentYear: faculty.employmentYear,
        departmentId: faculty.departmentId,
      };
    }
  }

  async update(id: number, updateDepartmentDto: UpdateUserDto) {
    return this.prisma.department.update({
      where: { id },
      data: updateDepartmentDto,
    });
  }

  async remove(id: number) {
    return this.prisma.department.delete({
      where: { id },
    });
  }
  async login(email: string, password: string): Promise<LoginDto> {
    console.log('email', email);
    console.log('password', password);
    const user = await this.prisma.customUser.findUnique({
      where: { email: email },
    });

    if (!user) {
      throw new NotFoundException(`No user found for email: ${user}`);
    }

    if (user.lockUntil && new Date(user.lockUntil) > new Date()) {
      throw new UnauthorizedException(
        'Your account is temporarily locked. Please try again later.',
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const failedLoginAttempts = user.failedLoginAttempts + 1;
      if (failedLoginAttempts >= 5) {
        await this.prisma.customUser.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: failedLoginAttempts,
            lockUntil: new Date(Date.now() + 30 * 60000), // 30 minutes from now
          },
        });
        throw new UnauthorizedException(
          'Invalid password. Your account has been locked for 30 minutes.',
        );
      } else {
        await this.prisma.customUser.update({
          where: { id: user.id },
          data: { failedLoginAttempts: failedLoginAttempts },
        });
        throw new UnauthorizedException('Invalid password');
      }
    }

    if (user.failedLoginAttempts > 0) {
      await this.prisma.customUser.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lockUntil: null },
      });
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        'Your account is locked please contact admin',
      );
    }
    let role = '';
    if (user.isAdmin) {
      role = 'admin';
    } else if (user.isFaculty) {
      role = 'faculty';
    } else {
      role = 'student';
    }

    return {
      accessToken: this.jwtService.sign({ userId: user.id }),
      id: user.id,
      firstName: user.firstName,
      role: role,
    };
  }

  async profile(user: UserEntity) {
    let role = '';
    if (user.isAdmin) {
      role = 'admin';
    } else if (user.isFaculty) {
      role = 'faculty';
    } else {
      role = 'student';
    }

    if (role == 'admin') {
      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        middleName: user.middleName,
        phoneNumber: user.phoneNumber,
        gender: user.gender,
        academicDetails: user.academicDetails,
        role: role,
      };
    }
    if (role == 'student') {
      const student = await this.prisma.studentProfile.findFirst({
        where: { userId: user.id },
      });
      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        middleName: user.middleName,
        phoneNumber: user.phoneNumber,
        gender: user.gender,
        academicDetails: user.academicDetails,
        role: role,
        collegeId: student.collegeId,
        enrollmentYear: student.enrollmentYear,
        credits: student.credits,
        courseType: student.courseType,
      };
    }
    if (role == 'faculty') {
      const faculty = await this.prisma.facultyProfile.findFirst({
        where: { userId: user.id },
      });
      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        middleName: user.middleName,
        phoneNumber: user.phoneNumber,
        gender: user.gender,
        academicDetails: user.academicDetails,
        role: role,
        employmentType: faculty.employmentType,
        domain: faculty.domain,
        employmentYear: faculty.employmentYear,
        departmentId: faculty.departmentId,
      };
    }
  }

  async register(registerDto: RegisterDto): Promise<AuthEntityDto> {
    const {
      email,
      gender,
      phoneNumber,
      firstName,
      middleName,
      lastName,
      academicDetails,
      courseType,
    } = registerDto;
    const existingUser = await this.prisma.customUser.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('User already exists!');
    }

    const existingPhoneNumber = await this.prisma.customUser.findUnique({
      where: { phoneNumber },
    });
    if (existingPhoneNumber) {
      throw new ConflictException('Phone Number already exists!');
    }
    const password = this.passwordGenerator.generateRandomPassword();
    console.log('Email', email);
    console.log('Password', password);
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.customUser.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        gender,
        lastName,
        phoneNumber,
        middleName,
        academicDetails,
        isActive: true,
        isAdmin: false,
        isStudent: true,
        isFaculty: false,
      },
    });
    const today = new Date();

    const student = await this.prisma.studentProfile.create({
      data: {
        enrollmentYear: today.getFullYear(),
        courseType,
        collegeId: await this.generateStudentId(firstName, lastName),
        userId: user.id,
        credits: 0,
      },
    });
    //const accessToken = this.jwtService.sign({ userId: user.id });
    return {
      id: student.id,
    };
  }

  async adminRegister(registerDto: AdminRegisterDto): Promise<AuthEntityDto> {
    const {
      email,
      gender,
      phoneNumber,
      firstName,
      middleName,
      lastName,
      academicDetails,
    } = registerDto;
    const existingUser = await this.prisma.customUser.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('User already exists!');
    }

    const existingPhoneNumber = await this.prisma.customUser.findUnique({
      where: { phoneNumber },
    });
    if (existingPhoneNumber) {
      throw new ConflictException('Phone Number already exists!');
    }
    const password = this.passwordGenerator.generateRandomPassword();
    console.log('Email', email);
    console.log('Password', password);

    const emailSubject = 'Your Admin Account Registration';
    const emailContent = `Welcome ${firstName} ${lastName},\nYour admin account has been created.\nYour temporary password is: ${password}`;

    try {
      await sendEmail(email, emailSubject, emailContent);
    } catch (error) {
      console.error('Failed to send email:', error);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.customUser.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        gender,
        lastName,
        phoneNumber,
        middleName,
        academicDetails,
        isActive: true,
        isAdmin: true,
        isStudent: false,
        isFaculty: false,
      },
    });
    return {
      id: user.id,
    };
  }

  async facultyRegister(
    facultyRegisterDto: FacultyRegisterDto,
  ): Promise<AuthEntityDto> {
    const {
      email,
      gender,
      phoneNumber,
      firstName,
      middleName,
      lastName,
      academicDetails,
      employmentType,
      domain,
      departmentId,
    } = facultyRegisterDto;
    const existingUser = await this.prisma.customUser.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('User already exists!');
    }

    const existingPhoneNumber = await this.prisma.customUser.findUnique({
      where: { phoneNumber },
    });
    if (existingPhoneNumber) {
      throw new ConflictException('Phone Number already exists!');
    }

    const password = this.passwordGenerator.generateRandomPassword();
    console.log('Email', email);
    console.log('Password', password);
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.customUser.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        gender,
        lastName,
        phoneNumber,
        middleName,
        academicDetails,
        isActive: true,
        isAdmin: false,
        isStudent: false,
        isFaculty: true,
      },
    });
    const today = new Date();

    const faculty = await this.prisma.facultyProfile.create({
      data: {
        employmentType: employmentType,
        domain: domain,
        employmentYear: today.getFullYear(),
        userId: user.id,
        departmentId: departmentId,
      },
    });
    //const accessToken = this.jwtService.sign({ userId: user.id });
    return {
      id: faculty.id,
    };
  }
}
