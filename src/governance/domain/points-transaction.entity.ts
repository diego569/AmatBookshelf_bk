
export class PointsTransaction {
    constructor(
        public readonly id: string,
        public readonly pointsAccountId: string,
        public readonly points: number,
        public readonly sourceType: string, // e.g. "manual", "rule", "incident"
        public readonly sourceId?: string | null,
        public readonly description?: string | null,
        public readonly createdAt?: Date,
    ) { }
}
