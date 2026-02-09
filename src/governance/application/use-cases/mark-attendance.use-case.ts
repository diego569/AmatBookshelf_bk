
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IAttendanceRepository } from '../../domain/repositories/IAttendanceRepository';
import { ISessionRepository } from '../../../program/domain/repositories/ISessionRepository';
import { AttendanceRecord } from '../../domain/attendance-record.entity';
import { AttendanceMarkedEvent } from '../../domain/events/attendance-marked.event';
import { BulkAttendanceDto } from '../../interfaces/dto/mark-attendance.dto';

@Injectable()
export class MarkAttendanceUseCase {
    constructor(
        @Inject(IAttendanceRepository)
        private readonly attendanceRepository: IAttendanceRepository,
        @Inject(ISessionRepository)
        private readonly sessionRepository: ISessionRepository,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    async execute(sessionId: string, dto: BulkAttendanceDto): Promise<void> {
        const session = await this.sessionRepository.findById(sessionId);
        if (!session) {
            throw new NotFoundException(`Session with ID ${sessionId} not found`);
        }

        const records = dto.marks.map(mark => {
            return new AttendanceRecord(
                crypto.randomUUID(), // New ID
                sessionId,
                mark.membershipId,
                mark.status,
                mark.minutesLate || 0,
                mark.checkInAt ? new Date(mark.checkInAt) : undefined,
                undefined, // markedByMembershipId - could be added if needed
                mark.notes,
            );
        });

        // Bulk upsert
        await this.attendanceRepository.uploadBulk(records);

        // Emit events for asynchronous governance logic (points, incidents)
        for (const record of records) {
            this.eventEmitter.emit(
                'attendance.marked',
                new AttendanceMarkedEvent(session.clubId, sessionId, record)
            );
        }
    }
}
