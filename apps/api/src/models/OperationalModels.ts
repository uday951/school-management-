import mongoose, { Schema } from 'mongoose';

const tenant = {
  schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
  branchId: { type: Schema.Types.ObjectId, ref: 'Branch', index: true },
  isArchived: { type: Boolean, default: false, index: true },
  isDeleted: { type: Boolean, default: false, index: true },
};
const model = (name: string, definition: Record<string, any>, indexes: any[] = []) => {
  const schema = new Schema({ ...tenant, ...definition }, { timestamps: true });
  indexes.forEach((index) => schema.index(index));
  return mongoose.models[name] || mongoose.model(name, schema);
};

export const Branch = model('Branch', {
  name: { type: String, required: true, trim: true }, code: { type: String, required: true, trim: true },
  address: String, phone: String, email: String, isActive: { type: Boolean, default: true },
}, [{ schoolId: 1, code: 1 }]);
export const Building = model('Building', {
  name: { type: String, required: true, trim: true }, branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true, index: true },
  code: String,
}, [{ schoolId: 1, branchId: 1, name: 1 }]);
export const Floor = model('Floor', {
  name: { type: String, required: true, trim: true }, number: { type: Number, required: true },
  buildingId: { type: Schema.Types.ObjectId, ref: 'Building', required: true, index: true },
}, [{ buildingId: 1, number: 1 }]);
export const SubjectGroup = model('SubjectGroup', {
  name: { type: String, required: true, trim: true }, code: { type: String, required: true, trim: true },
  subjectIds: [{ type: Schema.Types.ObjectId, ref: 'Subject', required: true }],
  selectionRule: { type: String, enum: ['ONE', 'MIN_MAX', 'ALL'], default: 'ONE' }, minSelections: { type: Number, default: 1 }, maxSelections: { type: Number, default: 1 },
}, [{ schoolId: 1, code: 1 }]);
export const ClassBatch = model('ClassBatch', {
  name: { type: String, required: true, trim: true }, sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true, index: true },
  studentIds: [{ type: Schema.Types.ObjectId, ref: 'Student' }], capacity: { type: Number, required: true, min: 1 }, purpose: { type: String, enum: ['LAB', 'LANGUAGE', 'ELECTIVE', 'CUSTOM'], default: 'CUSTOM' },
}, [{ schoolId: 1, sectionId: 1, name: 1 }]);
export const Holiday = model('Holiday', {
  name: { type: String, required: true, trim: true }, startDate: { type: Date, required: true, index: true }, endDate: { type: Date, required: true },
  type: { type: String, enum: ['NATIONAL', 'SCHOOL', 'WEATHER', 'EMERGENCY'], default: 'SCHOOL' }, affectsScheduling: { type: Boolean, default: true },
});
export const SchoolEvent = model('SchoolEvent', {
  name: { type: String, required: true, trim: true }, type: { type: String, enum: ['SPORTS_DAY', 'WORKSHOP', 'GUEST_LECTURE', 'EXAM', 'OTHER'], default: 'OTHER' },
  startAt: { type: Date, required: true }, endAt: { type: Date, required: true }, sectionIds: [{ type: Schema.Types.ObjectId, ref: 'Section' }], roomIds: [{ type: Schema.Types.ObjectId, ref: 'Room' }],
});
export const TeacherAbsence = model('TeacherAbsence', {
  teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true, index: true }, startDate: { type: Date, required: true }, endDate: { type: Date, required: true },
  reason: { type: String, required: true }, status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'], default: 'PENDING' }, substituteTeacherId: { type: Schema.Types.ObjectId, ref: 'Teacher' },
});
export const Homework = model('Homework', {
  title: { type: String, required: true, trim: true }, instructions: String, dueAt: { type: Date, required: true },
  sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true, index: true }, subjectId: { type: Schema.Types.ObjectId, ref: 'Subject' }, teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true }, timeSlotId: { type: Schema.Types.ObjectId, ref: 'TimeSlot' }, resourceUrls: [String],
});
export const Attendance = model('Attendance', {
  date: { type: Date, required: true, index: true }, sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true, index: true },
  periodIndex: Number, markedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }, entries: [{ studentId: { type: Schema.Types.ObjectId, ref: 'Student' }, status: { type: String, enum: ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'], required: true }, note: String }],
}, [{ schoolId: 1, sectionId: 1, date: 1, periodIndex: 1 }]);
export const ExamTimetable = model('ExamTimetable', {
  name: { type: String, required: true, trim: true }, termId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  status: { type: String, enum: ['DRAFT', 'REVIEWED', 'PUBLISHED', 'ARCHIVED'], default: 'DRAFT' }, slots: [{ startsAt: Date, endsAt: Date, subjectId: { type: Schema.Types.ObjectId, ref: 'Subject' }, sectionIds: [{ type: Schema.Types.ObjectId, ref: 'Section' }], roomIds: [{ type: Schema.Types.ObjectId, ref: 'Room' }], invigilatorIds: [{ type: Schema.Types.ObjectId, ref: 'Teacher' }] }],
});
export const ResourceBooking = model('ResourceBooking', {
  resourceName: { type: String, required: true, trim: true }, resourceType: { type: String, enum: ['PROJECTOR', 'SMARTBOARD', 'VEHICLE', 'EQUIPMENT', 'ROOM'], default: 'EQUIPMENT' },
  startsAt: { type: Date, required: true }, endsAt: { type: Date, required: true }, requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }, status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'], default: 'PENDING' },
});
export const Notification = model('Notification', {
  recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true }, channel: { type: String, enum: ['IN_APP', 'EMAIL', 'SMS', 'WHATSAPP'], default: 'IN_APP' }, title: { type: String, required: true }, body: { type: String, required: true }, status: { type: String, enum: ['QUEUED', 'SENT', 'FAILED', 'READ'], default: 'QUEUED' }, sentAt: Date,
});
