
export class Cycle {
    constructor(
        public readonly id: string,
        public readonly clubId: string,
        public name: string,
        public startDate: Date,
        public theme?: string | null,
        public endDate?: Date | null,
        public createdAt?: Date,
    ) { }
}
