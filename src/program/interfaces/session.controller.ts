
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SessionService } from '../application/session.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
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

    @Get('clubs/:clubId/live-session')
    @ApiOperation({ summary: 'Get the current live session for a club' })
    @ApiResponse({ status: 200, description: 'Live session found (or null when no session is live)' })
    findLive(@Param('clubId') clubId: string) {
        return this.sessionService.findLiveByClub(clubId);
    }

    @Get('sessions/:id')
    findOne(@Param('id') id: string) {
        return this.sessionService.findOne(id);
    }

    @Post('sessions/:id/start')
    @ApiOperation({ summary: 'Start a session and mark it as LIVE' })
    @ApiResponse({ status: 200, description: 'Session started successfully' })
    @ApiResponse({ status: 400, description: 'Another session is already live for this club' })
    start(@Param('id') id: string) {
        return this.sessionService.start(id);
    }

    @Post('sessions/:id/end')
    @ApiOperation({ summary: 'End a session and mark it as ENDED' })
    @ApiResponse({ status: 200, description: 'Session ended successfully' })
    end(@Param('id') id: string) {
        return this.sessionService.end(id);
    }

    @Patch('sessions/:id')
    @ApiOperation({ summary: 'Update a session by ID' })
    @ApiResponse({ status: 200, description: 'Session updated successfully' })
    update(@Param('id') id: string, @Body() dto: UpdateSessionDto) {
        return this.sessionService.update(id, dto);
    }

    @Delete('sessions/:id')
    remove(@Param('id') id: string) {
        return this.sessionService.remove(id);
    }
}
