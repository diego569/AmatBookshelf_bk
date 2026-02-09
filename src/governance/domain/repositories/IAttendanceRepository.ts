
import { AttendanceRecord } from '../attendance-record.entity';

export interface IAttendanceRepository {
    create(record: AttendanceRecord): Promise<AttendanceRecord>;
    uploadBulk(records: AttendanceRecord[]): Promise<void>;
    findBySessionAndMembership(sessionId: string, membershipId: string): Promise<AttendanceRecord | null>;
    findAllBySession(sessionId: string): Promise<AttendanceRecord[]>;
    findAllByMembership(membershipId: string): Promise<AttendanceRecord[]>;
}

export const IAttendanceRepository = Symbol('IAttendanceRepository');
