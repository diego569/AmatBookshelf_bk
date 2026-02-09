
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/infrastructure/prisma/prisma.service';
import { IPointsRepository } from '../domain/repositories/IPointsRepository';
import { PointsAccount } from '../domain/points-account.entity';
import { PointsTransaction } from '../domain/points-transaction.entity';
import { PointsMapper } from './mappers/points.mapper';

@Injectable()
export class PrismaPointsRepository implements IPointsRepository {
    constructor(private readonly prisma: PrismaService) { }

    async createAccount(account: PointsAccount): Promise<PointsAccount> {
        const created = await this.prisma.pointsAccount.create({
            data: {
                id: undefined,
                clubId: account.clubId,
                membershipId: account.membershipId,
                cycleId: account.cycleId,
            }
        });
        return PointsMapper.toDomainAccount(created);
    }

    async findAccount(clubId: string, membershipId: string, cycleId?: string | null): Promise<PointsAccount | null> {
        // Unique constraint is [clubId, cycleId, membershipId].
        // If cycleId is null, we look for that specific record.
        // Prisma treats null in composite unique constraints as distinct values in some SQL flavors,
        // but PostgreSQL supports it in unique index.

        // We need to query by findFirst or findUnique if composite is set up right
        // In schema: @@unique([clubId, cycleId, membershipId])

        // Wait, if cycleId is optional/nullable, findUnique requires all fields.
        // Let's use findFirst to be safe if Prisma type gen is strict about nulls in unique input.
        const account = await this.prisma.pointsAccount.findFirst({
            where: {
                clubId,
                membershipId,
                cycleId: cycleId ?? null,
            },
            include: {
                transactions: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        });
        if (!account) return null;
        return PointsMapper.toDomainAccount(account);
    }

    async addTransaction(transaction: PointsTransaction): Promise<PointsTransaction> {
        const created = await this.prisma.pointsTransaction.create({
            data: {
                id: undefined,
                pointsAccountId: transaction.pointsAccountId,
                points: transaction.points,
                sourceType: transaction.sourceType,
                sourceId: transaction.sourceId,
                description: transaction.description,
            }
        });
        return PointsMapper.toDomainTransaction(created);
    }

    async getTransactions(accountId: string): Promise<PointsTransaction[]> {
        const txs = await this.prisma.pointsTransaction.findMany({
            where: { pointsAccountId: accountId },
            orderBy: { createdAt: 'asc' }
        });
        return txs.map(PointsMapper.toDomainTransaction);
    }

    async getLeaderboard(clubId: string, cycleId?: string | null, limit: number = 10): Promise<{ membershipId: string; points: number }[]> {
        // Aggregation required.
        // Group by pointsAccount -> membershipId, sum points.
        // Filter by clubId, cycleId.

        // Prisma aggregation:
        const accounts = await this.prisma.pointsAccount.findMany({
            where: {
                clubId,
                cycleId: cycleId ?? null,
            },
            select: {
                membershipId: true,
                transactions: {
                    select: {
                        points: true
                    }
                }
            }
            // This fetches all txs. Might be heavy?
            // Better: groupBy on pointsTransaction join?
            // Prisma doesn't support deep groupBy on relation easily for sum across relations without raw query or separate aggregation step.
            // But we can limit accounts if we could sort by sum...
            // For MVP: Fetch all accounts for club+cycle (usually < 50 members), sum in memory, sort.
        });

        const leaderboard = accounts.map(acc => {
            const total = acc.transactions.reduce((sum, tx) => sum + Number(tx.points), 0);
            return { membershipId: acc.membershipId, points: total };
        });

        return leaderboard
            .sort((a, b) => b.points - a.points)
            .slice(0, limit);
    }
}
