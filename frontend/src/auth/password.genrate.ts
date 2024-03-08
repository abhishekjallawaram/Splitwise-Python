import { Injectable } from '@nestjs/common';

@Injectable()
export class PasswordService {
  private readonly digits = '0123456789';
  private readonly specialCharacters = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  private readonly uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  private readonly lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz';

  generateRandomPassword(): string {
    let password = '';
    password += this.randomChar(this.digits);
    password += this.randomChar(this.specialCharacters);
    password += this.randomChar(this.uppercaseLetters);

    while (password.length < 15) {
      const allChars =
        this.digits +
        this.specialCharacters +
        this.uppercaseLetters +
        this.lowercaseLetters;
      password += this.randomChar(allChars);
    }

    password = this.shuffleString(password);

    if (!this.validatePassword(password)) {
      return this.generateRandomPassword(); // Regenerate if validation fails
    }

    return password;
  }

  private randomChar(str: string): string {
    return str[Math.floor(Math.random() * str.length)];
  }

  private shuffleString(str: string): string {
    return str
      .split('')
      .sort(() => 0.5 - Math.random())
      .join('');
  }

  private validatePassword(password: string): boolean {
    const regex = /((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,})/;
    return regex.test(password);
  }
}
