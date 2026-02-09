
export enum AttendanceStatus {
    PRESENT = 'PRESENT',
    ABSENT = 'ABSENT',
    EXCUSED = 'EXCUSED',
}

export class AttendanceRecord {
    constructor(
        public readonly id: string,
        public readonly sessionId: string,
        public readonly membershipId: string,
        public status: AttendanceStatus,
        public minutesLate: number = 0,
        public checkInAt?: Date | null,
        public markedByMembershipId?: string | null,
        public notes?: string | null,
        public createdAt?: Date,
    ) { }
}
