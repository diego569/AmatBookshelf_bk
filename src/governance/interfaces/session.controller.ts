import { Controller, Get, Param, UseGuards, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { QrCodeService } from '../application/qr-code.service';
import { JwtAuthGuard } from '../../identity/infrastructure/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../identity/infrastructure/auth/decorators/current-user.decorator';
import { ISessionRepository } from '../../program/domain/repositories/ISessionRepository';
import { IMembershipRepository } from '../../identity/domain/repositories/IMembershipRepository';

@ApiTags('Governance - Sessions')
@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionController {
    constructor(
        private readonly qrCodeService: QrCodeService,
        @Inject(ISessionRepository)
        private readonly sessionRepository: ISessionRepository,
        @Inject(IMembershipRepository)
        private readonly membershipRepository: IMembershipRepository,
    ) { }

    @Get(':sessionId/qr-token')
    @ApiOperation({ summary: 'Generate QR token for session attendance (Manager only)' })
    @ApiResponse({ status: 200, description: 'QR token generated successfully' })
    async getQrToken(
        @Param('sessionId') sessionId: string,
        @CurrentUser() user: { personId: string },
    ) {
        // 1. Get the session
        const session = await this.sessionRepository.findById(sessionId);
        if (!session) {
            throw new NotFoundException('Session not found');
        }

        // 2. Get the user's membership in that club
        const memberships = await this.membershipRepository.findByPersonId(user.personId);
        const memberInClub = memberships.find(m => m.clubId === session.clubId);

        // 3. Check if they have ADMIN or MODERATOR role
        if (!memberInClub || (memberInClub.role !== 'admin' && memberInClub.role !== 'MODERATOR')) {
            throw new ForbiddenException('Only admins or moderators can generate QR tokens');
        }

        const token = this.qrCodeService.generateQrToken(
            session.id,
            session.clubId,
            session.cycleId ?? undefined
        );

        return {
            qrToken: token,
            expiresIn: 30, // seconds
        };
    }
}
