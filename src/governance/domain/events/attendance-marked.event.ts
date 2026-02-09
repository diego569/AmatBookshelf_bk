
import { AttendanceRecord } from '../../domain/attendance-record.entity';

export class AttendanceMarkedEvent {
    constructor(
        public readonly clubId: string,
        public readonly sessionId: string,
        public readonly record: AttendanceRecord,
    ) { }
}
