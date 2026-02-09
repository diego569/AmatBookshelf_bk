
import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { IPointsRepository } from '../domain/repositories/IPointsRepository';

@ApiTags('Governance - Points')
@Controller()
export class PointsController {
    constructor(
        @Inject(IPointsRepository)
        private readonly pointsRepository: IPointsRepository,
    ) { }

    @Get('memberships/:membershipId/points')
    @ApiOperation({ summary: 'Get points summary for a membership' })
    @ApiQuery({ name: 'cycleId', required: false })
    async getPoints(
        @Param('membershipId') membershipId: string,
        @Query('cycleId') cycleId?: string,
        @Query('clubId') clubId?: string, // Usually needed to scope account
    ) {
        // Since account is (club, cycle, membership).
        // If clubId is missing, we might need a different strategy or require it.
        // For MVP, if we have membershipId and cycleId, maybe we can find it?
        // But the repo needs clubId.

        // Let's assume for now that if clubId is not provided, we might need to find membership first
        // or require clubId in the query.
        if (!clubId) {
            return { error: 'clubId is required' };
        }

        const account = await this.pointsRepository.findAccount(clubId, membershipId, cycleId);
        if (!account) return { points: 0, transactions: [] };

        const transactions = await this.pointsRepository.getTransactions(account.id);
        const total = transactions.reduce((sum, tx) => sum + tx.points, 0);

        return {
            points: total,
            transactions: transactions,
        };
    }

    @Get('clubs/:clubId/leaderboard')
    @ApiOperation({ summary: 'Get club leaderboard' })
    @ApiQuery({ name: 'cycleId', required: false })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    async getLeaderboard(
        @Param('clubId') clubId: string,
        @Query('cycleId') cycleId?: string,
        @Query('limit') limit: number = 10,
    ) {
        return this.pointsRepository.getLeaderboard(clubId, cycleId, Number(limit));
    }
}
