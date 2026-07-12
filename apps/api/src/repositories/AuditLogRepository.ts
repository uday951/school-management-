import { AuditLog, IAuditLogDocument } from '../models/AuditLog';

export class AuditLogRepository {
  async log(data: {
    userId?: string;
    email?: string;
    action: string;
    module: string;
    description: string;
    ipAddress: string;
    userAgent?: string;
  }): Promise<IAuditLogDocument> {
    const newLog = new AuditLog({
      ...data,
      timestamp: new Date(),
    });
    return newLog.save();
  }

  async getRecentLogs(limit = 100): Promise<IAuditLogDocument[]> {
    return AuditLog.find().sort({ timestamp: -1 }).limit(limit).populate('userId', 'email profile').exec();
  }
}
