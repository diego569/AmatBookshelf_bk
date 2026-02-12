import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export interface QrTokenPayload {
    sessionId: string;
    clubId: string;
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
    generateQrToken(sessionId: string, clubId: string): string {
        const payload: QrTokenPayload = {
            sessionId,
            clubId,
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
            const payload = this.jwtService.verify<QrTokenPayload>(token, {
                secret: this.QR_SECRET,
            });

            // Additional check: ensure timestamp is within acceptable range
            const now = Date.now();
            const tokenAge = (now - payload.timestamp) / 1000; // in seconds

            if (tokenAge > this.QR_EXPIRY_SECONDS) {
                throw new UnauthorizedException('QR code has expired');
            }

            return payload;
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new UnauthorizedException('Invalid or expired QR code');
        }
    }
}
