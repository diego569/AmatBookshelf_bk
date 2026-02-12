import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Public()
    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth() {
        // Initiates Google OAuth flow
    }

    @Public()
    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthCallback(@Req() req) {
        const person = await this.authService.validateGoogleUser(req.user);
        const tokens = await this.authService.login(person.id, person.email);
        return tokens;
    }

    @Public()
    @Post('refresh')
    async refresh(@Body() dto: RefreshTokenDto) {
        return this.authService.refreshTokens(dto.refreshToken);
    }

    @Post('logout')
    async logout(@CurrentUser() user: { personId: string }) {
        await this.authService.logout(user.personId);
        return { message: 'Logged out successfully' };
    }
}
