import { Controller, Get, Inject } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from './shared/infrastructure/prisma/prisma.service';

@ApiTags('App Context')
@Controller('app-context')
export class AppContextController {
    constructor(private readonly prisma: PrismaService) { }

    @Get()
    @ApiOperation({ summary: 'Get default context (Club and Cycle) for the frontend' })
    async getContext() {
        const club = await this.prisma.club.findFirst({
            where: { name: 'Librero de Amat' }
        });

        if (!club) {
            return { error: 'Default club not found' };
        }

        const cycle = await this.prisma.cycle.findFirst({
            where: { clubId: club.id },
            orderBy: { startDate: 'desc' }
        });

        return {
            defaultClubId: club.id,
            defaultClubName: club.name,
            defaultCycleId: cycle?.id ?? null,
            defaultCycleName: cycle?.name ?? null,
        };
    }
}
