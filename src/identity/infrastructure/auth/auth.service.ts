import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './interfaces/auth.interface';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async validateGoogleUser(profile: {
        googleId: string;
        email: string;
        fullName: string;
    }) {
        // Check if user exists by googleId
        let person = await this.prisma.person.findFirst({
            where: { googleId: profile.googleId },
        });

        if (person) {
            return person;
        }

        // Check if user exists by email
        person = await this.prisma.person.findFirst({
            where: { email: profile.email },
        });

        if (person) {
            // Link Google account to existing user
            person = await this.prisma.person.update({
                where: { id: person.id },
                data: { googleId: profile.googleId },
            });
            return person;
        }

        // Create new user
        person = await this.prisma.person.create({
            data: {
                googleId: profile.googleId,
                email: profile.email,
                fullName: profile.fullName,
            },
        });

        return person;
    }

    async login(personId: string, email: string | null) {
        const payload: JwtPayload = { sub: personId, email: email || '' };
        const accessToken = this.jwtService.sign(payload, {
            expiresIn: '15m',
        });
        const refreshToken = this.jwtService.sign(payload, {
            expiresIn: '7d',
        });

        // Store refresh token
        await this.prisma.person.update({
            where: { id: personId },
            data: { refreshToken: await bcrypt.hash(refreshToken, 10) },
        });

        return {
            accessToken,
            refreshToken,
        };
    }

    async refreshTokens(refreshToken: string) {
        try {
            const payload = this.jwtService.verify(refreshToken);
            const person = await this.prisma.person.findUnique({
                where: { id: payload.sub },
            });

            if (!person || !person.refreshToken) {
                throw new UnauthorizedException('Invalid refresh token');
            }

            const isValid = await bcrypt.compare(refreshToken, person.refreshToken);
            if (!isValid) {
                throw new UnauthorizedException('Invalid refresh token');
            }

            return this.login(person.id, person.email || '');
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async logout(personId: string) {
        await this.prisma.person.update({
            where: { id: personId },
            data: { refreshToken: null },
        });
    }
}
