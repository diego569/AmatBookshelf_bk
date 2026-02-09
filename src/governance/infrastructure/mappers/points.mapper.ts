
import { PointsAccount as PrismaAccount, PointsTransaction as PrismaTransaction } from '@prisma/client';
import { PointsAccount } from '../../domain/points-account.entity';
import { PointsTransaction } from '../../domain/points-transaction.entity';

export class PointsMapper {
    static toDomainAccount(prisma: PrismaAccount & { transactions?: PrismaTransaction[] }): PointsAccount {
        return new PointsAccount(
            prisma.id,
            prisma.clubId,
            prisma.membershipId,
            prisma.cycleId,
            prisma.transactions ? prisma.transactions.map(PointsMapper.toDomainTransaction) : [],
        );
    }

    static toDomainTransaction(prisma: PrismaTransaction): PointsTransaction {
        return new PointsTransaction(
            prisma.id,
            prisma.pointsAccountId,
            Number(prisma.points), // Decimal to Number
            prisma.sourceType,
            prisma.sourceId,
            prisma.description,
            prisma.createdAt,
        );
    }

    // Persistence methods 
    // Note: We usually save Transactions individually or Accounts.
    // Account itself doesn't have mutable fields other than relations in this MVP.
}
