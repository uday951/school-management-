import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';
import { UserRole } from '@mahathi/types';

/**
 * Restricts access to specific user roles.
 */
export function requireRoles(...allowedRoles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required.' },
      });
    }

    const { role } = req.user;
    if (!allowedRoles.includes(role as UserRole)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access Denied: You do not have permissions to perform this action.',
        },
      });
    }

    next();
  };
}

/**
 * Predefined Role-to-Permissions mappings for flexible checking
 */
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  SUPER_ADMIN: ['*'],
  SCHOOL_ADMIN: ['*'],
  BRANCH_ADMIN: ['VIEW_TIMETABLE', 'EDIT_TIMETABLE', 'GENERATE_TIMETABLE', 'VIEW_REPORTS', 'EDIT_ACADEMIC', 'EDIT_USERS'],
  PRINCIPAL: ['VIEW_TIMETABLE', 'APPROVE_SWAP', 'VIEW_REPORTS', 'EDIT_ACADEMIC', 'EDIT_USERS'],
  COORDINATOR: ['VIEW_TIMETABLE', 'EDIT_TIMETABLE', 'GENERATE_TIMETABLE', 'APPROVE_SWAP', 'VIEW_REPORTS', 'EDIT_ACADEMIC', 'EDIT_USERS'],
  TEACHER: ['VIEW_TIMETABLE', 'REQUEST_SWAP', 'EDIT_TIMETABLE'],
  STUDENT: ['VIEW_TIMETABLE'],
  PARENT: ['VIEW_TIMETABLE'],
};

/**
 * Restricts access based on permissions associated with the user's role.
 */
export function requirePermission(permission: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required.' },
      });
    }

    const { role } = req.user;
    const permissions = ROLE_PERMISSIONS[role as UserRole] || [];

    if (permissions.includes('*') || permissions.includes(permission)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: `Access Denied: Role '${role}' requires permission '${permission}'.`,
      },
    });
  };
}
