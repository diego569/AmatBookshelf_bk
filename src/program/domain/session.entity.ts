
export enum SessionType {
    LECTURA = 'LECTURA',
    COORDINACION = 'COORDINACION',
    EXTRAORDINARIA = 'EXTRAORDINARIA',
}

export class Session {
    constructor(
        public readonly id: string,
        public readonly clubId: string,
        public sessionType: SessionType,
        public startsAt: Date,
        public cycleId?: string | null,
        public endsAt?: Date | null,
        public title?: string | null,
        public createdAt?: Date,
    ) { }
}
