import { Body, Controller, Get, Param, Post, Query, UseGuards, Inject, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MarkAttendanceUseCase } from '../application/use-cases/mark-attendance.use-case';
import { BulkAttendanceDto } from './dto/mark-attendance.dto';
import { ScanQrDto } from './dto/scan-qr.dto';
import { ScanResponseDto } from './dto/scan-response.dto';
import { IAttendanceRepository } from '../domain/repositories/IAttendanceRepository';
import { QrCodeService } from '../application/qr-code.service';
import { JwtAuthGuard } from '../../identity/infrastructure/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../identity/infrastructure/auth/decorators/current-user.decorator';
import { ISessionRepository } from '../../program/domain/repositories/ISessionRepository';
import { IMembershipRepository } from '../../identity/domain/repositories/IMembershipRepository';
import { IPointsRepository } from '../domain/repositories/IPointsRepository';
import { IRuleSetRepository } from '../domain/repositories/IRuleSetRepository';
import { AttendanceRecord, AttendanceStatus } from '../domain/attendance-record.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AttendanceMarkedEvent } from '../domain/events/attendance-marked.event';
import { RuleEvaluatorService } from '../application/services/rule-evaluator.service';
import { Membership, MemberRole, MemberStatus } from '../../identity/domain/membership.entity';
import { PointsAccount } from '../domain/points-account.entity';
import { PointsTransaction } from '../domain/points-transaction.entity';

@ApiTags('Governance - Attendance')
@Controller()
export class AttendanceController {
    private readonly logger = new Logger(AttendanceController.name);

    constructor(
        private readonly markAttendanceUseCase: MarkAttendanceUseCase,
        @Inject(IAttendanceRepository)
        private readonly attendanceRepository: IAttendanceRepository,
        private readonly qrCodeService: QrCodeService,
        @Inject(ISessionRepository)
        private readonly sessionRepository: ISessionRepository,
        @Inject(IMembershipRepository)
        private readonly membershipRepository: IMembershipRepository,
        @Inject(IPointsRepository)
        private readonly pointsRepository: IPointsRepository,
        @Inject(IRuleSetRepository)
        private readonly ruleSetRepository: IRuleSetRepository,
        private readonly ruleEvaluator: RuleEvaluatorService,
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
    @ApiResponse({ status: 201, type: ScanResponseDto, description: 'Attendance marked successfully' })
    async scanQr(
        @Body() dto: ScanQrDto,
        @CurrentUser() user: { personId: string },
    ): Promise<ScanResponseDto> {
        // 1. Verify QR token
        const payload = this.qrCodeService.verifyQrToken(dto.qrToken);

        // 2. Get session
        const session = await this.sessionRepository.findById(payload.sessionId);
        if (!session) {
            throw new NotFoundException('Session not found');
        }

        // 3. Find or Create Membership (Auto-join)
        const memberships = await this.membershipRepository.findByPersonId(user.personId);
        let membership = memberships.find(
            m => m.clubId === payload.clubId && m.status === MemberStatus.ACTIVE
        );

        if (!membership) {
            this.logger.log(`Auto-joining person ${user.personId} to club ${payload.clubId}`);
            membership = new Membership(
                randomUUID(),
                payload.clubId,
                user.personId,
                MemberRole.MEMBER,
                MemberStatus.ACTIVE
            );
            membership = await this.membershipRepository.create(membership);
        }

        // 4. Calculate minutes late
        const checkInTime = new Date();
        const sessionStart = session.startsAt;
        const minutesLate = Math.max(
            0,
            Math.floor((checkInTime.getTime() - sessionStart.getTime()) / (1000 * 60))
        );

        // 5. Create attendance record
        const recordId = randomUUID();
        const record = new AttendanceRecord(
            recordId,
            payload.sessionId,
            membership.id,
            AttendanceStatus.PRESENT,
            minutesLate,
            checkInTime,
            undefined,
            dto.lat && dto.long ? `Lat: ${dto.lat}, Long: ${dto.long}` : undefined,
        );

        // 6. Save record
        await this.attendanceRepository.uploadBulk([record]);

        // 7. Immediate Governance Logic (Synchronous for UX feedback)
        let pointsDelta = 0;
        let totalPoints = 0;

        try {
            const appliesTo = `SESSION:${session.sessionType}`;
            const ruleSet = await this.ruleSetRepository.findActive(payload.clubId, appliesTo, new Date());

            if (ruleSet) {
                const evaluation = this.ruleEvaluator.evaluate(ruleSet, record);
                pointsDelta = evaluation.points;

                if (pointsDelta !== 0) {
                    let account = await this.pointsRepository.findAccount(payload.clubId, membership.id, session.cycleId);
                    if (!account) {
                        account = await this.pointsRepository.createAccount(
                            new PointsAccount(randomUUID(), payload.clubId, membership.id, session.cycleId)
                        );
                    }

                    await this.pointsRepository.addTransaction(
                        new PointsTransaction(
                            randomUUID(),
                            account.id,
                            pointsDelta,
                            'RULE',
                            ruleSet.id,
                            `Points for session ${session.title || session.id}`
                        )
                    );

                    // Fetch updated total
                    const transactions = await this.pointsRepository.getTransactions(account.id);
                    totalPoints = transactions.reduce((sum, tx) => sum + Number(tx.points), 0);
                }
            }
        } catch (err) {
            this.logger.error(`Error calculating immediate points: ${err.message}`, err.stack);
        }

        // 8. Emit event for remaining logic (e.g. Incidents)
        this.eventEmitter.emit(
            'attendance.marked',
            new AttendanceMarkedEvent(payload.clubId, payload.sessionId, record)
        );

        return {
            ok: true,
            status: minutesLate > 0 ? 'LATE' : 'ON_TIME', // Simple logic for feedback
            minutesLate,
            pointsDelta,
            totalPoints,
            membershipId: membership.id,
            sessionId: session.id,
            message: minutesLate > 0 ? `Asistencia registrada (${minutesLate} min tarde)` : '¡Llegaste a tiempo!',
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
