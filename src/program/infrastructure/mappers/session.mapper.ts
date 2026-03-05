
import { Session as PrismaSession, SessionStatus as PrismaSessionStatus, SessionType as PrismaSessionType } from '@prisma/client';
import { Session, SessionStatus, SessionType } from '../../domain/session.entity';

export class SessionMapper {
    static toDomain(prisma: PrismaSession): Session {
        return new Session(
            prisma.id,
            prisma.clubId,
            SessionMapper.mapType(prisma.sessionType),
            prisma.startsAt,
            SessionMapper.mapStatus(prisma.status),
            prisma.cycleId,
            prisma.endsAt,
            prisma.startedAt,
            prisma.endedAt,
            prisma.title,
            prisma.createdAt,
        );
    }

    static toPersistence(domain: Session): PrismaSession {
        return {
            id: domain.id,
            clubId: domain.clubId,
            cycleId: domain.cycleId ?? null,
            sessionType: SessionMapper.mapTypeForPrisma(domain.sessionType),
            status: SessionMapper.mapStatusForPrisma(domain.status),
            startsAt: domain.startsAt,
            endsAt: domain.endsAt ?? null,
            startedAt: domain.startedAt ?? null,
            endedAt: domain.endedAt ?? null,
            title: domain.title ?? null,
            createdAt: new Date(),
            updatedAt: new Date(),
        } as PrismaSession;
    }

    private static mapType(type: PrismaSessionType): SessionType {
        return SessionType[type as keyof typeof SessionType] || SessionType.LECTURA;
    }

    private static mapTypeForPrisma(type: SessionType): PrismaSessionType {
        // Assuming enum names match exactly
        return PrismaSessionType[type as keyof typeof PrismaSessionType];
    }

    private static mapStatus(status: PrismaSessionStatus): SessionStatus {
        return SessionStatus[status as keyof typeof SessionStatus] || SessionStatus.SCHEDULED;
    }

    private static mapStatusForPrisma(status: SessionStatus): PrismaSessionStatus {
        return PrismaSessionStatus[status as keyof typeof PrismaSessionStatus];
    }
}
