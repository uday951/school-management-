import { z } from 'zod';

export const RegisterInputSchema = z.object({
  email: z.string().email({ message: 'Invalid email address format.' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long.' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter.' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter.' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number.' })
    .regex(/[^a-zA-Z0-9]/, { message: 'Password must contain at least one special character.' }),
  role: z.enum(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'BRANCH_ADMIN', 'PRINCIPAL', 'COORDINATOR', 'TEACHER', 'STUDENT', 'PARENT'], {
    required_error: 'User role selection is required.',
  }),
  schoolId: z.string().optional(),
  schoolName: z.string().min(2, { message: 'School name must be at least 2 characters.' }).optional(),
  profile: z.object({
    firstName: z.string().min(2, { message: 'First name must be at least 2 characters.' }),
    lastName: z.string().min(2, { message: 'Last name must be at least 2 characters.' }),
    phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid phone number format.' }).optional().or(z.literal('')),
  }),
});

export type RegisterInput = z.infer<typeof RegisterInputSchema>;

export const LoginInputSchema = z.object({
  email: z.string().email({ message: 'Invalid email address format.' }),
  password: z.string().min(1, { message: 'Password cannot be empty.' }),
});

export type LoginInput = z.infer<typeof LoginInputSchema>;

export const ForgotPasswordInputSchema = z.object({
  email: z.string().email({ message: 'Invalid email address format.' }),
});

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordInputSchema>;

export const ResetPasswordInputSchema = z.object({
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long.' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter.' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter.' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number.' })
    .regex(/[^a-zA-Z0-9]/, { message: 'Password must contain at least one special character.' }),
  confirmPassword: z.string().min(1, { message: 'Please confirm your password.' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
});

export type ResetPasswordInput = z.infer<typeof ResetPasswordInputSchema>;

// =================================================
// ERP INPUT VALIDATIONS
// =================================================

export const RoomInputSchema = z.object({
  name: z.string().min(2, { message: 'Room name must be at least 2 characters.' }),
  type: z.enum(['CLASSROOM', 'SCIENCE_LAB', 'COMPUTER_LAB', 'LANGUAGE_LAB', 'LIBRARY', 'AUDITORIUM', 'GROUND', 'SPORTS_AREA']),
  capacity: z.number().min(1, { message: 'Room capacity must be at least 1.' }),
  resourceTags: z.array(z.string()).default([]),
  availabilityConstraints: z.array(z.object({
    dayOfWeek: z.number().min(1).max(7),
    periodIndex: z.number().min(0),
  })).optional(),
});

export type RoomInput = z.infer<typeof RoomInputSchema>;

export const GradeInputSchema = z.object({
  name: z.string().min(2, { message: 'Grade name must be at least 2 characters (e.g. Grade 10).' }),
});

export type GradeInput = z.infer<typeof GradeInputSchema>;

export const SectionInputSchema = z.object({
  gradeId: z.string().min(1, { message: 'Grade reference is required.' }),
  name: z.string().min(1, { message: 'Section name must be at least 1 character (e.g. Section A).' }),
  classTeacherId: z.string().optional(),
  studentCount: z.number().min(0).default(0),
  schoolTimings: z.object({
    workingDays: z.array(z.number()).default([1, 2, 3, 4, 5]),
    schoolStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Invalid time format (HH:MM).' }),
    schoolEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Invalid time format (HH:MM).' }),
    periods: z.array(z.object({
      name: z.string().min(1),
      durationMinutes: z.number().min(5),
      isBreak: z.boolean().default(false),
      isLunch: z.boolean().default(false),
    })).default([]),
  }),
});

export type SectionInput = z.infer<typeof SectionInputSchema>;

export const SubjectInputSchema = z.object({
  name: z.string().min(2, { message: 'Subject name must be at least 2 characters.' }),
  code: z.string().min(2, { message: 'Subject code must be at least 2 characters.' }),
  type: z.enum(['THEORY', 'PRACTICAL', 'LAB']),
  weeklyPeriodCount: z.number().min(1),
  maxDailyPeriods: z.number().min(1).default(2),
  minDailyPeriods: z.number().min(0).default(0),
  doublePeriod: z.boolean().default(false),
  triplePeriod: z.boolean().default(false),
  isOptional: z.boolean().default(false),
  isElective: z.boolean().default(false),
  isActivitySubject: z.boolean().default(false),
});

export type SubjectInput = z.infer<typeof SubjectInputSchema>;

export const TeacherInputSchema = z.object({
  userId: z.string().min(1, { message: 'User reference is required.' }),
  employeeId: z.string().min(2, { message: 'Employee ID must be at least 2 characters.' }),
  department: z.string().min(2, { message: 'Department must be at least 2 characters.' }),
  qualifications: z.array(z.string()).default([]),
  experienceYears: z.number().min(0).default(0),
  maxDailyLoad: z.number().min(1).default(6),
  maxWeeklyLoad: z.number().min(1).default(30),
  preferences: z.object({
    morningOnly: z.boolean().default(false),
    afternoonOnly: z.boolean().default(false),
    preferredPeriods: z.array(z.object({ dayOfWeek: z.number(), periodIndex: z.number() })).default([]),
    unavailablePeriods: z.array(z.object({ dayOfWeek: z.number(), periodIndex: z.number() })).default([]),
  }).default({}),
  isPartTime: z.boolean().default(false),
  isShared: z.boolean().default(false),
});

export type TeacherInput = z.infer<typeof TeacherInputSchema>;

export const StudentInputSchema = z.object({
  admissionNumber: z.string().min(2, { message: 'Admission number is required.' }),
  rollNumber: z.string().min(1, { message: 'Roll number is required.' }),
  firstName: z.string().min(2, { message: 'First name is required.' }),
  lastName: z.string().min(2, { message: 'Last name is required.' }),
  sectionId: z.string().min(1, { message: 'Section reference is required.' }),
  guardian: z.object({
    name: z.string().min(2, { message: 'Guardian name is required.' }),
    relation: z.string().min(2, { message: 'Guardian relation is required.' }),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid phone number.' }),
  }),
  electiveIds: z.array(z.string()).default([]),
});

export type StudentInput = z.infer<typeof StudentInputSchema>;

export const ActivityInputSchema = z.object({
  name: z.enum(['SPORTS', 'YOGA', 'KARATE', 'DANCE', 'MUSIC', 'ART', 'ROBOTICS', 'SWIMMING', 'TABLE_TENNIS', 'SKATING']),
  teacherId: z.string().optional(),
  roomId: z.string().optional(),
  allowedDays: z.array(z.number()).default([1, 2, 3, 4, 5]),
  allowedSessions: z.array(z.string()).default(['AFTERNOON']),
  maxDailyClasses: z.number().min(1).default(2),
});

export type ActivityInput = z.infer<typeof ActivityInputSchema>;
