
import { AttendanceRecord as PrismaAttendance, AttendanceStatus as PrismaStatus } from '@prisma/client';
import { AttendanceRecord, AttendanceStatus } from '../../domain/attendance-record.entity';

export class AttendanceMapper {
    static toDomain(prisma: PrismaAttendance): AttendanceRecord {
        return new AttendanceRecord(
            prisma.id,
            prisma.sessionId,
            prisma.membershipId,
            AttendanceMapper.mapStatus(prisma.status),
            prisma.minutesLate,
            prisma.checkInAt,
            prisma.markedByMembershipId,
            prisma.notes,
            prisma.createdAt,
        );
    }

    static toPersistence(domain: AttendanceRecord): PrismaAttendance {
        return {
            id: domain.id,
            sessionId: domain.sessionId,
            membershipId: domain.membershipId,
            status: AttendanceMapper.mapStatusForPrisma(domain.status),
            minutesLate: domain.minutesLate,
            checkInAt: domain.checkInAt ?? null,
            markedByMembershipId: domain.markedByMembershipId ?? null,
            notes: domain.notes ?? null,
            createdAt: new Date(),
            updatedAt: new Date(),
        } as PrismaAttendance;
    }

    private static mapStatus(status: PrismaStatus): AttendanceStatus {
        return AttendanceStatus[status as keyof typeof AttendanceStatus] || AttendanceStatus.PRESENT;
    }

    private static mapStatusForPrisma(status: AttendanceStatus): PrismaStatus {
        return PrismaStatus[status as keyof typeof PrismaStatus];
    }
}
