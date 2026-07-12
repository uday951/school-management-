import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { School } from '../models/School';
import { User } from '../models/User';
import { AcademicYear } from '../models/AcademicYear';
import { Room } from '../models/Room';
import { Grade } from '../models/Grade';
import { Section } from '../models/Section';
import { Subject } from '../models/Subject';
import { Teacher } from '../models/Teacher';
import { Student } from '../models/Student';
import { Activity } from '../models/Activity';
import { TimetableDraft } from '../models/TimetableDraft';
import { TimeSlot } from '../models/TimeSlot';
import { LessonRequirement } from '../models/LessonRequirement';
import { AuditLog } from '../models/AuditLog';
import { Branch, Building, Floor, SubjectGroup, ClassBatch, Holiday, SchoolEvent, TeacherAbsence, Homework, Attendance, ExamTimetable, ResourceBooking, Notification } from '../models/OperationalModels';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/school-timetable-system';

async function seedDatabase() {
  try {
    console.log('Connecting to database:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    // 1. Wipe existing data
    console.log('Purging existing collections...');
    await Promise.all([
      School.deleteMany({}), User.deleteMany({}), AcademicYear.deleteMany({}),
      Room.deleteMany({}), Grade.deleteMany({}), Section.deleteMany({}),
      Subject.deleteMany({}), Teacher.deleteMany({}), Student.deleteMany({}),
      Activity.deleteMany({}), TimetableDraft.deleteMany({}),
      TimeSlot.deleteMany({}), LessonRequirement.deleteMany({}), AuditLog.deleteMany({}),
      Branch.deleteMany({}), Building.deleteMany({}), Floor.deleteMany({}), SubjectGroup.deleteMany({}),
      ClassBatch.deleteMany({}), Holiday.deleteMany({}), SchoolEvent.deleteMany({}), TeacherAbsence.deleteMany({}),
      Homework.deleteMany({}), Attendance.deleteMany({}), ExamTimetable.deleteMany({}), ResourceBooking.deleteMany({}), Notification.deleteMany({}),
    ]);
    console.log('Database purged.');

    // 2. School
    const school = await School.create({
      name: 'Lincoln Academy', subscriptionTier: 'PREMIUM',
      branches: [{ name: 'Main Campus', code: 'MC' }],
      buildings: [{ name: 'Main Block', blocks: [{ name: 'A-Block', floors: ['Ground Floor', 'First Floor'] }] }],
      departments: ['Mathematics', 'Science', 'English', 'Sports'], isActive: true,
    });
    console.log('School seeded:', school.name);

    const branch = await Branch.create({ schoolId: school._id, name: 'Main Campus', code: 'MC', address: '1 Academy Road, Bengaluru', phone: '+918000000001' });
    const building = await Building.create({ schoolId: school._id, branchId: branch._id, name: 'Academic Block', code: 'AB' });
    const floor = await Floor.create({ schoolId: school._id, branchId: branch._id, buildingId: building._id, name: 'Ground Floor', number: 0 });

    // 3. Academic Year
    const term = await AcademicYear.create({
      schoolId: school._id, name: 'Academic Year 2026-27',
      startDate: new Date('2026-06-01'), endDate: new Date('2027-04-30'),
      terms: [{ name: 'Term 1', startDate: new Date('2026-06-01'), endDate: new Date('2026-11-30') }],
      isActive: true,
    });
    console.log('Academic Year seeded:', term.name);

    // 4. Users (raw password — hashed by pre-save hook)
    const raw = 'Password123!';
    const coordinator = await User.create({ email: 'coordinator@lincoln.com', passwordHash: raw, role: 'COORDINATOR', schoolId: school._id.toString(), profile: { firstName: 'Emma', lastName: 'Watson', phoneNumber: '+1234567890' }, isVerified: true });
    const userJohn  = await User.create({ email: 'john@lincoln.com',  passwordHash: raw, role: 'TEACHER', schoolId: school._id.toString(), profile: { firstName: 'John',  lastName: 'Doe'    }, isVerified: true });
    const userClara = await User.create({ email: 'clara@lincoln.com', passwordHash: raw, role: 'TEACHER', schoolId: school._id.toString(), profile: { firstName: 'Clara', lastName: 'Oswald' }, isVerified: true });
    const userRavi  = await User.create({ email: 'ravi@lincoln.com',  passwordHash: raw, role: 'TEACHER', schoolId: school._id.toString(), profile: { firstName: 'Ravi',  lastName: 'Sharma' }, isVerified: true });
    console.log('Users seeded. Coordinator:', coordinator.email);

    // 5. Teacher profiles
    const teacherJohn = await Teacher.create({ userId: userJohn._id, schoolId: school._id, branchId: branch._id, employeeId: 'T-101', department: 'Mathematics', maxDailyLoad: 5, maxWeeklyLoad: 25, preferences: { morningOnly: true, afternoonOnly: false, preferredPeriods: [], unavailablePeriods: [] } });
    const teacherClara = await Teacher.create({ userId: userClara._id, schoolId: school._id, branchId: branch._id, employeeId: 'T-102', department: 'Science', maxDailyLoad: 6, maxWeeklyLoad: 30, preferences: { morningOnly: false, afternoonOnly: false, preferredPeriods: [], unavailablePeriods: [] } });
    const teacherRavi = await Teacher.create({ userId: userRavi._id, schoolId: school._id, branchId: branch._id, employeeId: 'T-103', department: 'English', maxDailyLoad: 6, maxWeeklyLoad: 24, preferences: { morningOnly: false, afternoonOnly: true, preferredPeriods: [], unavailablePeriods: [] } });
    console.log('Teacher profiles seeded.');

    // 6. Rooms
    const room101    = await Room.create({ schoolId: school._id, name: 'Room 101',    type: 'CLASSROOM',   capacity: 40 });
    const room102    = await Room.create({ schoolId: school._id, name: 'Room 102',    type: 'CLASSROOM',   capacity: 35 });
    const physicsLab = await Room.create({ schoolId: school._id, name: 'Physics Lab', type: 'SCIENCE_LAB', capacity: 30 });
    const playground = await Room.create({ schoolId: school._id, name: 'Ground',      type: 'GROUND',      capacity: 100 });
    console.log('Rooms seeded.');

    // 7. Grades
    const grade9  = await Grade.create({ schoolId: school._id, name: 'Grade 9' });
    const grade10 = await Grade.create({ schoolId: school._id, name: 'Grade 10' });

    // 8. Sections (with period config)
    const periodConfig = [
      { name: 'P1', durationMinutes: 45 }, { name: 'P2', durationMinutes: 45 },
      { name: 'P3', durationMinutes: 45 }, { name: 'Break', durationMinutes: 15, isBreak: true },
      { name: 'P4', durationMinutes: 45 }, { name: 'P5', durationMinutes: 45 },
      { name: 'Lunch', durationMinutes: 45, isLunch: true },
      { name: 'P6', durationMinutes: 45 }, { name: 'P7', durationMinutes: 45 }, { name: 'P8', durationMinutes: 45 },
    ];
    const section9A  = await Section.create({ schoolId: school._id, gradeId: grade9._id,  name: 'Grade 9-A',  classTeacherId: userRavi._id,  studentCount: 32, schoolTimings: { workingDays: [1,2,3,4,5], schoolStart: '08:30', schoolEnd: '15:30', periods: periodConfig } });
    const section10A = await Section.create({ schoolId: school._id, gradeId: grade10._id, name: 'Grade 10-A', classTeacherId: userJohn._id,  studentCount: 30, schoolTimings: { workingDays: [1,2,3,4,5], schoolStart: '08:30', schoolEnd: '15:30', periods: periodConfig } });
    console.log('Sections seeded.');

    // 9. Subjects
    const math = await Subject.create({ schoolId: school._id, name: 'Mathematics', code: 'MATH', type: 'THEORY', weeklyPeriodCount: 5 });
    const phys = await Subject.create({ schoolId: school._id, name: 'Physics',     code: 'PHYS', type: 'THEORY', weeklyPeriodCount: 4 });
    const chem = await Subject.create({ schoolId: school._id, name: 'Chemistry',   code: 'CHEM', type: 'THEORY', weeklyPeriodCount: 4 });
    const eng  = await Subject.create({ schoolId: school._id, name: 'English',     code: 'ENG',  type: 'THEORY', weeklyPeriodCount: 4 });
    const pe   = await Subject.create({ schoolId: school._id, name: 'Physical Ed', code: 'PE',   type: 'THEORY', weeklyPeriodCount: 2 });
    console.log('Subjects seeded.');

    // 10. Lesson Requirements
    await LessonRequirement.create({ schoolId: school._id, sectionId: section9A._id,  subjectId: math._id, teacherId: userJohn._id,  periodsPerWeek: 5, preferredRoomTag: 'CLASSROOM'   });
    await LessonRequirement.create({ schoolId: school._id, sectionId: section9A._id,  subjectId: phys._id, teacherId: userClara._id, periodsPerWeek: 4, preferredRoomTag: 'SCIENCE_LAB' });
    await LessonRequirement.create({ schoolId: school._id, sectionId: section9A._id,  subjectId: chem._id, teacherId: userClara._id, periodsPerWeek: 4, preferredRoomTag: 'SCIENCE_LAB' });
    await LessonRequirement.create({ schoolId: school._id, sectionId: section9A._id,  subjectId: eng._id,  teacherId: userRavi._id,  periodsPerWeek: 4, preferredRoomTag: 'CLASSROOM'   });
    await LessonRequirement.create({ schoolId: school._id, sectionId: section10A._id, subjectId: math._id, teacherId: userJohn._id,  periodsPerWeek: 5, preferredRoomTag: 'CLASSROOM'   });
    await LessonRequirement.create({ schoolId: school._id, sectionId: section10A._id, subjectId: phys._id, teacherId: userClara._id, periodsPerWeek: 5, preferredRoomTag: 'SCIENCE_LAB' });
    await LessonRequirement.create({ schoolId: school._id, sectionId: section10A._id, subjectId: chem._id, teacherId: userClara._id, periodsPerWeek: 4, preferredRoomTag: 'SCIENCE_LAB' });
    await LessonRequirement.create({ schoolId: school._id, sectionId: section10A._id, subjectId: eng._id,  teacherId: userRavi._id,  periodsPerWeek: 4, preferredRoomTag: 'CLASSROOM'   });
    await LessonRequirement.create({ schoolId: school._id, sectionId: section10A._id, subjectId: pe._id,   teacherId: userRavi._id,  periodsPerWeek: 2, preferredRoomTag: 'GROUND'      });
    console.log('Lesson Requirements seeded.');

    // 11. Students
    await Student.create({ schoolId: school._id, admissionNumber: 'ADM-9001', rollNumber: '1', firstName: 'Alice',   lastName: 'Smith', sectionId: section9A._id,  guardian: { name: 'Bob Smith',   relation: 'Father', phone: '+1999999999' } });
    await Student.create({ schoolId: school._id, admissionNumber: 'ADM-1001', rollNumber: '1', firstName: 'Charlie', lastName: 'Brown', sectionId: section10A._id, guardian: { name: 'Sally Brown', relation: 'Mother', phone: '+1888888888' } });
    console.log('Students seeded.');

    // 12. Timetable Draft (status: SUCCESS so grid renders immediately)
    const draftId = new mongoose.Types.ObjectId('668f12a4b89f2d1a3c7e9999');
    await TimetableDraft.create({
      _id: draftId, schoolId: school._id, termId: term._id,
      version: 1, name: 'Lincoln Academy Term 1 Schedule', status: 'SUCCESS',
      solverStats: { conflictsScore: 0, solvingDurationMs: 4821 },
      lockedSlots: [],
    });
    console.log('Timetable Draft seeded: 668f12a4b89f2d1a3c7e9999');

    // 13. TimeSlots — FULLY CONFLICT-FREE
    // Constraints enforced: no teacher, room, or section appears twice in same (day, period)
    //
    // Per-period layout (same every day Mon–Fri):
    //   P0: John → 9A  MATH  room101    |  Ravi  → 10A ENG   room102
    //   P1: Clara→ 9A  PHYS  physicsLab |  John  → 10A MATH  room102
    //   P2: Ravi → 9A  ENG   room101    |  Clara → 10A CHEM  room102
    //   P3: (Break — no slots)
    //   P4: Clara→ 9A  CHEM  physicsLab |  Ravi  → 10A PE    playground
    //   P5: John → 9A  MATH  room101    |  Clara → 10A PHYS  room102

    const slots: any[] = [];
    const DAYS = [1, 2, 3, 4, 5];

    for (const day of DAYS) {
      slots.push({ draftId, schoolId: school._id, dayOfWeek: day, periodIndex: 0, sectionId: section9A._id,  teacherId: userJohn._id,  subjectId: math._id, classroomId: room101._id,    isLocked: false });
      slots.push({ draftId, schoolId: school._id, dayOfWeek: day, periodIndex: 0, sectionId: section10A._id, teacherId: userRavi._id,  subjectId: eng._id,  classroomId: room102._id,    isLocked: false });

      slots.push({ draftId, schoolId: school._id, dayOfWeek: day, periodIndex: 1, sectionId: section9A._id,  teacherId: userClara._id, subjectId: phys._id, classroomId: physicsLab._id, isLocked: false });
      slots.push({ draftId, schoolId: school._id, dayOfWeek: day, periodIndex: 1, sectionId: section10A._id, teacherId: userJohn._id,  subjectId: math._id, classroomId: room102._id,    isLocked: false });

      slots.push({ draftId, schoolId: school._id, dayOfWeek: day, periodIndex: 2, sectionId: section9A._id,  teacherId: userRavi._id,  subjectId: eng._id,  classroomId: room101._id,    isLocked: false });
      slots.push({ draftId, schoolId: school._id, dayOfWeek: day, periodIndex: 2, sectionId: section10A._id, teacherId: userClara._id, subjectId: chem._id, classroomId: room102._id,    isLocked: false });

      // P3 = Break — skip

      slots.push({ draftId, schoolId: school._id, dayOfWeek: day, periodIndex: 4, sectionId: section9A._id,  teacherId: userClara._id, subjectId: chem._id, classroomId: physicsLab._id, isLocked: false });
      slots.push({ draftId, schoolId: school._id, dayOfWeek: day, periodIndex: 4, sectionId: section10A._id, teacherId: userRavi._id,  subjectId: pe._id,   classroomId: playground._id, isLocked: false });

      slots.push({ draftId, schoolId: school._id, dayOfWeek: day, periodIndex: 5, sectionId: section9A._id,  teacherId: userJohn._id,  subjectId: math._id, classroomId: room101._id,    isLocked: false });
      slots.push({ draftId, schoolId: school._id, dayOfWeek: day, periodIndex: 5, sectionId: section10A._id, teacherId: userClara._id, subjectId: phys._id, classroomId: room102._id,    isLocked: false });
    }

    const savedSlots = await TimeSlot.insertMany(slots);
    console.log(`TimeSlots seeded: ${slots.length} conflict-free slots (${DAYS.length} days × 5 periods × 2 sections).`);

    // 14. Operational fixtures: these make every new UI module immediately testable.
    const [alice, charlie] = await Student.find({ schoolId: school._id }).sort({ admissionNumber: 1 });
    await SubjectGroup.create({ schoolId: school._id, branchId: branch._id, name: 'STEM Elective', code: 'STEM-EL', subjectIds: [phys._id, chem._id], selectionRule: 'ONE', minSelections: 1, maxSelections: 1 });
    await ClassBatch.create({ schoolId: school._id, branchId: branch._id, name: '9A Physics Lab — Batch 1', sectionId: section9A._id, studentIds: [alice._id], capacity: 16, purpose: 'LAB' });
    await Holiday.create({ schoolId: school._id, branchId: branch._id, name: 'Independence Day', startDate: new Date('2026-08-15'), endDate: new Date('2026-08-15'), type: 'NATIONAL', affectsScheduling: true });
    await SchoolEvent.create({ schoolId: school._id, branchId: branch._id, name: 'STEM Innovation Workshop', type: 'WORKSHOP', startAt: new Date('2026-08-21T09:00:00'), endAt: new Date('2026-08-21T12:00:00'), sectionIds: [section9A._id, section10A._id], roomIds: [physicsLab._id] });
    await TeacherAbsence.create({ schoolId: school._id, branchId: branch._id, teacherId: teacherRavi._id, startDate: new Date('2026-08-25'), endDate: new Date('2026-08-25'), reason: 'Medical appointment', status: 'APPROVED', substituteTeacherId: teacherClara._id });
    await Homework.insertMany([
      { schoolId: school._id, branchId: branch._id, title: 'Linear equations practice', instructions: 'Complete questions 1–15 from the worksheet.', dueAt: new Date('2026-07-17T17:00:00'), sectionId: section10A._id, subjectId: math._id, teacherId: teacherJohn._id, timeSlotId: savedSlots[1]._id },
      { schoolId: school._id, branchId: branch._id, title: 'Physics lab report', instructions: 'Submit the pendulum experiment observation table.', dueAt: new Date('2026-07-18T17:00:00'), sectionId: section9A._id, subjectId: phys._id, teacherId: teacherClara._id, timeSlotId: savedSlots[2]._id },
      { schoolId: school._id, branchId: branch._id, title: 'Reading response', instructions: 'Write a 200-word response to chapter 3.', dueAt: new Date('2026-07-19T17:00:00'), sectionId: section9A._id, subjectId: eng._id, teacherId: teacherRavi._id, timeSlotId: savedSlots[4]._id },
    ]);
    await Attendance.create({ schoolId: school._id, branchId: branch._id, date: new Date('2026-07-12'), sectionId: section9A._id, periodIndex: 0, markedBy: userJohn._id, entries: [{ studentId: alice._id, status: 'PRESENT' }] });
    await Attendance.create({ schoolId: school._id, branchId: branch._id, date: new Date('2026-07-12'), sectionId: section10A._id, periodIndex: 1, markedBy: userJohn._id, entries: [{ studentId: charlie._id, status: 'PRESENT' }] });
    await ExamTimetable.create({ schoolId: school._id, branchId: branch._id, name: 'Term 1 Mid-Year Exams', termId: term._id, status: 'PUBLISHED', slots: [{ startsAt: new Date('2026-09-14T09:00:00'), endsAt: new Date('2026-09-14T11:00:00'), subjectId: math._id, sectionIds: [section9A._id, section10A._id], roomIds: [room101._id, room102._id], invigilatorIds: [teacherClara._id, teacherRavi._id] }] });
    await ResourceBooking.create({ schoolId: school._id, branchId: branch._id, resourceName: 'Mobile projector P-01', resourceType: 'PROJECTOR', startsAt: new Date('2026-07-14T09:00:00'), endsAt: new Date('2026-07-14T10:00:00'), requestedBy: userClara._id, status: 'APPROVED' });
    await Notification.insertMany([
      { schoolId: school._id, branchId: branch._id, recipientId: userJohn._id, channel: 'IN_APP', title: 'Your timetable is published', body: 'Term 1 schedule is now available.', status: 'SENT', sentAt: new Date() },
      { schoolId: school._id, branchId: branch._id, recipientId: userClara._id, channel: 'IN_APP', title: 'Lab booking confirmed', body: 'Physics Lab is reserved for Grade 9-A.', status: 'SENT', sentAt: new Date() },
      { schoolId: school._id, branchId: branch._id, recipientId: userRavi._id, channel: 'IN_APP', title: 'Substitute assigned', body: 'Your absence on 25 August has been assigned to Clara.', status: 'SENT', sentAt: new Date() },
    ]);
    console.log('Operational modules seeded: electives, batches, attendance, homework, events, exams, bookings and notifications.');

    console.log('✅ Database successfully re-seeded with realistic timetable records.');
    process.exit(0);
  } catch (error) {
    console.error('Fatal Seeding Error:', error);
    process.exit(1);
  }
}

seedDatabase();
