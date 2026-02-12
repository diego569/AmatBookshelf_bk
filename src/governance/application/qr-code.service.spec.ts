import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { QrCodeService } from './qr-code.service';
import { UnauthorizedException } from '@nestjs/common';

describe('QrCodeService', () => {
    let service: QrCodeService;
    let jwtService: JwtService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                QrCodeService,
                {
                    provide: JwtService,
                    useValue: {
                        sign: jest.fn(),
                        verify: jest.fn(),
                    },
                },
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn().mockReturnValue('test-qr-secret'),
                    },
                },
            ],
        }).compile();

        service = module.get<QrCodeService>(QrCodeService);
        jwtService = module.get<JwtService>(JwtService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('generateQrToken', () => {
        it('should generate a signed JWT token with correct payload', () => {
            const sessionId = 'session-123';
            const clubId = 'club-456';
            const mockToken = 'mock-jwt-token';

            jest.spyOn(jwtService, 'sign').mockReturnValue(mockToken);

            const result = service.generateQrToken(sessionId, clubId);

            expect(result).toBe(mockToken);
            expect(jwtService.sign).toHaveBeenCalledWith(
                expect.objectContaining({
                    sessionId,
                    clubId,
                    timestamp: expect.any(Number),
                }),
                expect.objectContaining({
                    secret: 'test-qr-secret',
                    expiresIn: '30s',
                }),
            );
        });
    });

    describe('verifyQrToken', () => {
        it('should verify and return payload for valid token', () => {
            const mockPayload = {
                sessionId: 'session-123',
                clubId: 'club-456',
                timestamp: Date.now(),
            };

            jest.spyOn(jwtService, 'verify').mockReturnValue(mockPayload);

            const result = service.verifyQrToken('valid-token');

            expect(result).toEqual(mockPayload);
            expect(jwtService.verify).toHaveBeenCalledWith('valid-token', {
                secret: 'test-qr-secret',
            });
        });

        it('should throw UnauthorizedException for expired token (timestamp check)', () => {
            const expiredPayload = {
                sessionId: 'session-123',
                clubId: 'club-456',
                timestamp: Date.now() - 35000, // 35 seconds ago
            };

            jest.spyOn(jwtService, 'verify').mockReturnValue(expiredPayload);

            expect(() => service.verifyQrToken('expired-token')).toThrow(
                UnauthorizedException,
            );
            expect(() => service.verifyQrToken('expired-token')).toThrow(
                'QR code has expired',
            );
        });

        it('should throw UnauthorizedException for invalid token', () => {
            jest.spyOn(jwtService, 'verify').mockImplementation(() => {
                throw new Error('Invalid token');
            });

            expect(() => service.verifyQrToken('invalid-token')).toThrow(
                UnauthorizedException,
            );
            expect(() => service.verifyQrToken('invalid-token')).toThrow(
                'Invalid or expired QR code',
            );
        });

        it('should accept token within expiry window', () => {
            const recentPayload = {
                sessionId: 'session-123',
                clubId: 'club-456',
                timestamp: Date.now() - 15000, // 15 seconds ago (within 30s window)
            };

            jest.spyOn(jwtService, 'verify').mockReturnValue(recentPayload);

            const result = service.verifyQrToken('recent-token');

            expect(result).toEqual(recentPayload);
        });
    });
});
