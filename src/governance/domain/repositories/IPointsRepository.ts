
import { PointsAccount } from '../points-account.entity';
import { PointsTransaction } from '../points-transaction.entity';

export interface IPointsRepository {
    createAccount(account: PointsAccount): Promise<PointsAccount>;
    findAccount(clubId: string, membershipId: string, cycleId?: string | null): Promise<PointsAccount | null>;
    addTransaction(transaction: PointsTransaction): Promise<PointsTransaction>;
    getTransactions(accountId: string): Promise<PointsTransaction[]>;
    getLeaderboard(clubId: string, cycleId?: string | null, limit?: number): Promise<{ membershipId: string, points: number }[]>;
}

export const IPointsRepository = Symbol('IPointsRepository');
