
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { SessionService } from '../application/session.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { SessionType } from '../domain/session.entity';

@ApiTags('sessions')
@Controller()
export class SessionController {
    constructor(private readonly sessionService: SessionService) { }

    @Post('clubs/:clubId/sessions')
    create(@Param('clubId') clubId: string, @Body() dto: CreateSessionDto) {
        return this.sessionService.create(clubId, dto);
    }

    @Get('clubs/:clubId/sessions')
    @ApiQuery({ name: 'from', required: false, type: String })
    @ApiQuery({ name: 'to', required: false, type: String })
    @ApiQuery({ name: 'type', required: false, enum: SessionType })
    findAll(
        @Param('clubId') clubId: string,
        @Query('from') from?: string,
        @Query('to') to?: string,
        @Query('type') type?: SessionType,
    ) {
        return this.sessionService.findAllByClub(clubId, { from, to, type });
    }

    @Get('sessions/:id')
    findOne(@Param('id') id: string) {
        return this.sessionService.findOne(id);
    }
}
