
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/infrastructure/prisma/prisma.service';
import { IAttendanceRepository } from '../domain/repositories/IAttendanceRepository';
import { AttendanceRecord } from '../domain/attendance-record.entity';
import { AttendanceMapper } from './mappers/attendance.mapper';

@Injectable()
export class PrismaAttendanceRepository implements IAttendanceRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(record: AttendanceRecord): Promise<AttendanceRecord> {
        const data = AttendanceMapper.toPersistence(record);
        const created = await this.prisma.attendanceRecord.create({
            data: {
                id: undefined,
                sessionId: data.sessionId,
                membershipId: data.membershipId,
                status: data.status,
                minutesLate: data.minutesLate,
                checkInAt: data.checkInAt,
                markedByMembershipId: data.markedByMembershipId,
                notes: data.notes,
            }
        });
        return AttendanceMapper.toDomain(created);
    }

    async uploadBulk(records: AttendanceRecord[]): Promise<void> {
        // Prisma createMany is efficient for bulk
        const data = records.map(r => {
            const p = AttendanceMapper.toPersistence(r);
            return {
                id: p.id, // we might want to let DB generate ID or use pre-gen UUIDs
                sessionId: p.sessionId,
                membershipId: p.membershipId,
                status: p.status,
                minutesLate: p.minutesLate,
                checkInAt: p.checkInAt,
                markedByMembershipId: p.markedByMembershipId,
                notes: p.notes,
            };
        });

        // Using upsert logic might be better but createMany skips duplicates if configured or fails
        // The requirement says "Upsert attendance records".
        // Prisma createMany doesn't support upsert.
        // We can use a transaction with upsert promises.

        await this.prisma.$transaction(
            records.map(r => {
                const p = AttendanceMapper.toPersistence(r);
                return this.prisma.attendanceRecord.upsert({
                    where: {
                        sessionId_membershipId: {
                            sessionId: p.sessionId,
                            membershipId: p.membershipId
                        }
                    },
                    update: {
                        status: p.status,
                        minutesLate: p.minutesLate,
                        checkInAt: p.checkInAt,
                        markedByMembershipId: p.markedByMembershipId,
                        notes: p.notes,
                    },
                    create: {
                        // id: p.id, // Let's use generated ID logic from service or auto-gen?
                        // If service generated UUID, use it. If not, undef.
                        // Upsert create needs ID if not auto? No, default(uuid).
                        sessionId: p.sessionId,
                        membershipId: p.membershipId,
                        status: p.status,
                        minutesLate: p.minutesLate,
                        checkInAt: p.checkInAt,
                        markedByMembershipId: p.markedByMembershipId,
                        notes: p.notes,
                    }
                });
            })
        );
    }

    async findBySessionAndMembership(sessionId: string, membershipId: string): Promise<AttendanceRecord | null> {
        const record = await this.prisma.attendanceRecord.findUnique({
            where: {
                sessionId_membershipId: { sessionId, membershipId }
            }
        });
        if (!record) return null;
        return AttendanceMapper.toDomain(record);
    }

    async findAllBySession(sessionId: string): Promise<AttendanceRecord[]> {
        const records = await this.prisma.attendanceRecord.findMany({ where: { sessionId } });
        return records.map(AttendanceMapper.toDomain);
    }

    async findAllByMembership(membershipId: string): Promise<AttendanceRecord[]> {
        const records = await this.prisma.attendanceRecord.findMany({ where: { membershipId } });
        return records.map(AttendanceMapper.toDomain);
    }
}
