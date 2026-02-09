
import { Session as PrismaSession, SessionType as PrismaSessionType } from '@prisma/client';
import { Session, SessionType } from '../../domain/session.entity';

export class SessionMapper {
    static toDomain(prisma: PrismaSession): Session {
        return new Session(
            prisma.id,
            prisma.clubId,
            SessionMapper.mapType(prisma.sessionType),
            prisma.startsAt,
            prisma.cycleId,
            prisma.endsAt,
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
            startsAt: domain.startsAt,
            endsAt: domain.endsAt ?? null,
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
}
