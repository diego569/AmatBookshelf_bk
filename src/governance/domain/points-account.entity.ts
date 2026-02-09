
import { PointsTransaction } from './points-transaction.entity';

export class PointsAccount {
    constructor(
        public readonly id: string,
        public readonly clubId: string,
        public readonly membershipId: string,
        public readonly cycleId?: string | null,
        public transactions: PointsTransaction[] = [],
    ) { }

    public getBalance(): number {
        return this.transactions.reduce((sum, tx) => sum + tx.points, 0);
    }
}
