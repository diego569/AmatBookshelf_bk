
import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MarkAttendanceUseCase } from '../application/use-cases/mark-attendance.use-case';
import { BulkAttendanceDto } from './dto/mark-attendance.dto';
import { ScanQrDto } from './dto/scan-qr.dto';
import { IAttendanceRepository } from '../domain/repositories/IAttendanceRepository';
import { Inject } from '@nestjs/common';
import { QrCodeService } from '../application/qr-code.service';
import { JwtAuthGuard } from '../../identity/infrastructure/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../identity/infrastructure/auth/decorators/current-user.decorator';
import { ISessionRepository } from '../../program/domain/repositories/ISessionRepository';
import { IMembershipRepository } from '../../identity/domain/repositories/IMembershipRepository';
import { AttendanceRecord, AttendanceStatus } from '../domain/attendance-record.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AttendanceMarkedEvent } from '../domain/events/attendance-marked.event';
import { NotFoundException, BadRequestException } from '@nestjs/common';

@ApiTags('Governance - Attendance')
@Controller()
export class AttendanceController {
    constructor(
        private readonly markAttendanceUseCase: MarkAttendanceUseCase,
        @Inject(IAttendanceRepository)
        private readonly attendanceRepository: IAttendanceRepository,
        private readonly qrCodeService: QrCodeService,
        @Inject(ISessionRepository)
        private readonly sessionRepository: ISessionRepository,
        @Inject(IMembershipRepository)
        private readonly membershipRepository: IMembershipRepository,
        private readonly eventEmitter: EventEmitter2,
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

    @Post('attendance/scan')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Scan QR code to mark attendance' })
    @ApiResponse({ status: 201, description: 'Attendance marked successfully' })
    async scanQr(
        @Body() dto: ScanQrDto,
        @CurrentUser() user: { personId: string },
    ) {
        // 1. Verify QR token
        const payload = this.qrCodeService.verifyQrToken(dto.qrToken);

        // 2. Get session
        const session = await this.sessionRepository.findById(payload.sessionId);
        if (!session) {
            throw new NotFoundException('Session not found');
        }

        // 3. Check if user has active membership in the club
        const memberships = await this.membershipRepository.findByPersonId(user.personId);
        const activeMembership = memberships.find(
            m => m.clubId === payload.clubId && m.status === 'ACTIVE'
        );

        if (!activeMembership) {
            throw new BadRequestException('You are not an active member of this club');
        }

        // 4. Calculate minutes late
        const checkInTime = new Date();
        const sessionStart = session.startsAt;
        const minutesLate = Math.max(
            0,
            Math.floor((checkInTime.getTime() - sessionStart.getTime()) / (1000 * 60))
        );

        // 5. Create attendance record
        const record = new AttendanceRecord(
            crypto.randomUUID(),
            payload.sessionId,
            activeMembership.id,
            AttendanceStatus.PRESENT,
            minutesLate,
            checkInTime,
            undefined,
            dto.lat && dto.long ? `Lat: ${dto.lat}, Long: ${dto.long}` : undefined,
        );

        // 6. Save record
        await this.attendanceRepository.uploadBulk([record]);

        // 7. Emit event for governance logic
        this.eventEmitter.emit(
            'attendance.marked',
            new AttendanceMarkedEvent(payload.clubId, payload.sessionId, record)
        );

        return {
            message: minutesLate > 0 ? `Checked in (${minutesLate} minutes late)` : 'Checked in on time',
            minutesLate,
            checkInTime,
        };
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
