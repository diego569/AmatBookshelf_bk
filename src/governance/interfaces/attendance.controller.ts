
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MarkAttendanceUseCase } from '../application/use-cases/mark-attendance.use-case';
import { BulkAttendanceDto } from './dto/mark-attendance.dto';
import { IAttendanceRepository } from '../domain/repositories/IAttendanceRepository';
import { Inject } from '@nestjs/common';

@ApiTags('Governance - Attendance')
@Controller()
export class AttendanceController {
    constructor(
        private readonly markAttendanceUseCase: MarkAttendanceUseCase,
        @Inject(IAttendanceRepository)
        private readonly attendanceRepository: IAttendanceRepository,
    ) { }

    @Post('sessions/:sessionId/attendance')
    @ApiOperation({ summary: 'Bulk mark attendance for a session' })
    @ApiResponse({ status: 201, description: 'Attendance marked successfully' })
    async markAttendance(
        @Param('sessionId') sessionId: string,
        @Body() dto: BulkAttendanceDto,
    ) {
        await this.markAttendanceUseCase.execute(sessionId, dto);
        return { message: 'Attendance marked successfully' };
    }

    @Get('sessions/:sessionId/attendance')
    @ApiOperation({ summary: 'Get all attendance records for a session' })
    async getSessionAttendance(@Param('sessionId') sessionId: string) {
        return this.attendanceRepository.findAllBySession(sessionId);
    }

    @Get('memberships/:membershipId/attendance')
    @ApiOperation({ summary: 'Get all attendance records for a membership' })
    async getMembershipAttendance(@Param('membershipId') membershipId: string) {
        return this.attendanceRepository.findAllByMembership(membershipId);
    }
}
