import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export interface QrTokenPayload {
    sessionId: string;
    clubId: string;
    cycleId?: string;
    timestamp: number;
}

@Injectable()
export class QrCodeService {
    private readonly QR_SECRET: string;
    private readonly QR_EXPIRY_SECONDS = 30;

    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {
        this.QR_SECRET = this.configService.get<string>('QR_SECRET') || 'qr-secret-key';
    }

    /**
     * Generate a short-lived signed JWT for QR code
     * Expires in 30 seconds (TOTP-style)
     */
    generateQrToken(sessionId: string, clubId: string, cycleId?: string): string {
        const payload: QrTokenPayload = {
            sessionId,
            clubId,
            cycleId,
            timestamp: Date.now(),
        };

        return this.jwtService.sign(payload, {
            secret: this.QR_SECRET,
            expiresIn: `${this.QR_EXPIRY_SECONDS}s`,
        });
    }

    /**
     * Verify and decode the QR token
     * Throws UnauthorizedException if invalid or expired
     */
    verifyQrToken(token: string): QrTokenPayload {
        try {
            return this.jwtService.verify(token, { secret: this.QR_SECRET });
        } catch (err) {
            throw new BadRequestException('Invalid or expired QR token');
        }
    }
}
