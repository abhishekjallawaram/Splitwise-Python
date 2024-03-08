// roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CustomUser } from '@prisma/client'; // Import the CustomUser type
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles =
      this.reflector.get<string[]>(ROLES_KEY, context.getHandler()) || [];
    if (requiredRoles.length === 0) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user: CustomUser = request.user;
    const hasRole = requiredRoles.some((role) => {
      // Map the role to the user property
      const roleProperty = `is${role.charAt(0).toUpperCase() + role.slice(1)}`;
      return user[roleProperty];
    });

    return Boolean(user && hasRole);
  }
}
