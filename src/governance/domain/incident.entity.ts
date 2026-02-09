
export enum IncidentType {
    LATE = 'LATE',
    NO_SHOW = 'NO_SHOW',
    STRIKE = 'STRIKE',
    FINE = 'FINE',
    WARNING = 'WARNING',
    OTHER = 'OTHER',
}

export class Incident {
    constructor(
        public readonly id: string,
        public readonly clubId: string,
        public readonly membershipId: string,
        public type: IncidentType,
        public cycleId?: string | null,
        public sessionId?: string | null,
        public severity?: number | null,
        public value?: any, // JSON
        public reason?: string | null,
        public createdByMembershipId?: string | null,
        public createdAt?: Date,
    ) { }
}
