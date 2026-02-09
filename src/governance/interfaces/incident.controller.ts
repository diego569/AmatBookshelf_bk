
import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { IIncidentRepository } from '../domain/repositories/IIncidentRepository';

@ApiTags('Governance - Incidents')
@Controller('clubs/:clubId/incidents')
export class IncidentController {
    constructor(
        @Inject(IIncidentRepository)
        private readonly incidentRepository: IIncidentRepository,
    ) { }

    @Get()
    @ApiOperation({ summary: 'Get incidents for a club' })
    @ApiQuery({ name: 'from', required: false })
    @ApiQuery({ name: 'to', required: false })
    @ApiQuery({ name: 'type', required: false })
    @ApiQuery({ name: 'membershipId', required: false })
    async getIncidents(
        @Param('clubId') clubId: string,
        @Query('from') from?: string,
        @Query('to') to?: string,
        @Query('type') type?: string,
        @Query('membershipId') membershipId?: string,
    ) {
        return this.incidentRepository.findAllByClub(clubId, {
            from: from ? new Date(from) : undefined,
            to: to ? new Date(to) : undefined,
            type,
            membershipId,
        });
    }
}
