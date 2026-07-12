import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Student } from '../models/Student';
import { Teacher } from '../models/Teacher';
import { Section } from '../models/Section';
import { Subject } from '../models/Subject';
import { Room } from '../models/Room';
import { Activity } from '../models/Activity';
import { AuditLog } from '../models/AuditLog';

export async function getDashboardStats(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } });
    }

    const { schoolId, role } = req.user;
    const filter = role === 'SUPER_ADMIN' ? { isDeleted: { $ne: true } } : { schoolId, isDeleted: { $ne: true } };

    // Query counters in parallel
    const [students, teachers, classes, subjects, rooms, activities] = await Promise.all([
      Student.countDocuments(filter).exec(),
      Teacher.countDocuments(filter).exec(),
      Section.countDocuments(filter).exec(),
      Subject.countDocuments(filter).exec(),
      Room.countDocuments(filter).exec(),
      Activity.countDocuments(filter).exec(),
    ]);

    // Fetch recent logs
    const logFilter = role === 'SUPER_ADMIN' ? {} : { schoolId };
    const logs = await AuditLog.find(logFilter)
      .sort({ timestamp: -1 })
      .limit(6)
      .populate('userId', 'email profile')
      .exec();

    res.status(200).json({
      success: true,
      data: {
        stats: {
          students,
          teachers,
          classes,
          subjects,
          rooms,
          activities,
        },
        recentActivity: logs.map((log) => ({
          user: log.email || (log.userId as any)?.email || 'system',
          role: (log.userId as any)?.role || 'System',
          action: log.action,
          desc: log.description,
          ip: log.ipAddress,
          time: log.timestamp,
        })),
      },
    });
  } catch (error: any) {
    next(error);
  }
}
