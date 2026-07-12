export type UserRole = 'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'BRANCH_ADMIN' | 'PRINCIPAL' | 'COORDINATOR' | 'TEACHER' | 'STUDENT' | 'PARENT';

export interface IPermission {
  _id: string;
  name: string;
  description: string;
  module: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRole {
  _id: string;
  name: UserRole;
  description: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ISchool {
  _id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  subscriptionTier: 'FREE' | 'PREMIUM' | 'ENTERPRISE';
  branches: {
    name: string;
    code: string;
    address?: string;
  }[];
  buildings: {
    name: string;
    blocks: {
      name: string;
      floors: string[];
    }[];
  }[];
  departments: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAcademicYear {
  _id: string;
  schoolId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  terms: {
    name: string;
    startDate: Date;
    endDate: Date;
  }[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUser {
  _id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  schoolId?: string;
  branchId?: string;
  profile: {
    firstName: string;
    lastName: string;
    phoneNumber?: string;
  };
  isVerified: boolean;
  verificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuditLog {
  _id: string;
  userId?: string;
  email?: string;
  action: string;
  module: string;
  description: string;
  ipAddress: string;
  userAgent?: string;
  timestamp: Date;
}

// =================================================
// ERP MODULE INTERFACES
// =================================================

export type RoomType = 'CLASSROOM' | 'SCIENCE_LAB' | 'COMPUTER_LAB' | 'LANGUAGE_LAB' | 'LIBRARY' | 'AUDITORIUM' | 'GROUND' | 'SPORTS_AREA';

export interface IRoom {
  _id: string;
  schoolId: string;
  name: string;
  type: RoomType;
  capacity: number;
  resourceTags: string[]; // Shared resources / assets
  availabilityConstraints?: {
    dayOfWeek: number;
    periodIndex: number;
  }[];
  isArchived: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGrade {
  _id: string;
  schoolId: string;
  name: string; // e.g. "Grade 10"
  isArchived: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISection {
  _id: string;
  schoolId: string;
  gradeId: string; // Reference to Grade ID
  name: string; // e.g. "Section A"
  classTeacherId?: string; // Reference to Teacher ID
  studentCount: number;
  schoolTimings: {
    workingDays: number[]; // 1 = Mon, 5 = Fri
    schoolStart: string; // e.g. "08:30"
    schoolEnd: string; // e.g. "15:30"
    periods: {
      name: string;
      durationMinutes: number;
      isBreak: boolean;
      isLunch: boolean;
    }[];
  };
  isArchived: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISubject {
  _id: string;
  schoolId: string;
  name: string;
  code: string;
  type: 'THEORY' | 'PRACTICAL' | 'LAB';
  weeklyPeriodCount: number;
  maxDailyPeriods: number;
  minDailyPeriods: number;
  doublePeriod: boolean;
  triplePeriod: boolean;
  isOptional: boolean;
  isElective: boolean;
  isActivitySubject: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITeacher {
  _id: string;
  userId: string; // Reference to User ID
  schoolId: string;
  employeeId: string;
  department: string;
  qualifications: string[];
  experienceYears: number;
  maxDailyLoad: number;
  maxWeeklyLoad: number;
  preferences: {
    morningOnly: boolean;
    afternoonOnly: boolean;
    preferredPeriods: { dayOfWeek: number; periodIndex: number }[];
    unavailablePeriods: { dayOfWeek: number; periodIndex: number }[];
  };
  leaveRequests: {
    startDate: Date;
    endDate: Date;
    reason: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
  }[];
  isPartTime: boolean;
  isShared: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStudent {
  _id: string;
  schoolId: string;
  admissionNumber: string;
  rollNumber: string;
  firstName: string;
  lastName: string;
  sectionId: string; // Reference to Section ID
  guardian: {
    name: string;
    relation: string;
    phone: string;
  };
  electiveIds: string[]; // Reference to elective Subjects
  isArchived: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IActivity {
  _id: string;
  schoolId: string;
  name: 'SPORTS' | 'YOGA' | 'KARATE' | 'DANCE' | 'MUSIC' | 'ART' | 'ROBOTICS' | 'SWIMMING' | 'TABLE_TENNIS' | 'SKATING';
  teacherId?: string; // Reference to Teacher ID
  roomId?: string; // Reference to Room ID
  allowedDays: number[]; // e.g. [1, 3, 5]
  allowedSessions: string[]; // e.g. ["AFTERNOON"]
  maxDailyClasses: number;
  isArchived: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITimetableDraft {
  _id: string;
  schoolId: string;
  termId: string;
  version: number;
  name: string;
  status: 'DRAFT' | 'GENERATING' | 'SUCCESS' | 'FAILED' | 'REVIEWED' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';
  solverStats: {
    conflictsScore: number;
    solvingDurationMs: number;
    errorLog?: string;
  };
  lockedSlots: {
    dayOfWeek: number;
    periodIndex: number;
    sectionId: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ITimeSlot {
  _id: string;
  draftId: string;
  dayOfWeek: number;
  periodIndex: number;
  sectionId: string;
  teacherId: string;
  subjectId: string;
  classroomId: string;
}

export interface ILessonRequirement {
  _id: string;
  schoolId: string;
  sectionId: string;
  subjectId: string;
  teacherId: string;
  periodsPerWeek: number;
  preferredRoomTag: string;
  doublePeriodRequirement: boolean;
}
