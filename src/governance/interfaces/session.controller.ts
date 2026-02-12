import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { QrCodeService } from '../application/qr-code.service';
import { JwtAuthGuard } from '../../identity/infrastructure/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../identity/infrastructure/auth/decorators/current-user.decorator';

@ApiTags('Governance - Sessions')
@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionController {
    constructor(private readonly qrCodeService: QrCodeService) { }

    @Get(':sessionId/qr-token')
    @ApiOperation({ summary: 'Generate QR token for session attendance (Manager only)' })
    @ApiResponse({ status: 200, description: 'QR token generated successfully' })
    async getQrToken(
        @Param('sessionId') sessionId: string,
        @CurrentUser() user: { personId: string },
    ) {
        // TODO: Add authorization check to ensure user is Admin/Manager of the club
        // For now, we'll generate the token for any authenticated user
        // In a real implementation, you would:
        // 1. Get the session
        // 2. Get the user's membership in that club
        // 3. Check if they have ADMIN or MODERATOR role

        // For this implementation, we'll use a placeholder clubId
        // In production, you'd fetch this from the session
        const clubId = 'placeholder-club-id'; // TODO: Fetch from session

        const token = this.qrCodeService.generateQrToken(sessionId, clubId);
        return {
            qrToken: token,
            expiresIn: 30, // seconds
        };
    }
}
