
export enum SessionType {
    LECTURA = 'LECTURA',
    COORDINACION = 'COORDINACION',
    EXTRAORDINARIA = 'EXTRAORDINARIA',
}

export enum SessionStatus {
    SCHEDULED = 'SCHEDULED',
    LIVE = 'LIVE',
    ENDED = 'ENDED',
}

export class Session {
    constructor(
        public readonly id: string,
        public readonly clubId: string,
        public sessionType: SessionType,
        public startsAt: Date,
        public status: SessionStatus = SessionStatus.SCHEDULED,
        public cycleId?: string | null,
        public endsAt?: Date | null,
        public startedAt?: Date | null,
        public endedAt?: Date | null,
        public title?: string | null,
        public createdAt?: Date,
    ) { }
}
