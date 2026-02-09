
import { Incident as PrismaIncident, IncidentType as PrismaType } from '@prisma/client';
import { Incident, IncidentType } from '../../domain/incident.entity';

export class IncidentMapper {
    static toDomain(prisma: PrismaIncident): Incident {
        return new Incident(
            prisma.id,
            prisma.clubId,
            prisma.membershipId,
            IncidentMapper.mapType(prisma.type),
            prisma.cycleId,
            prisma.sessionId,
            prisma.severity,
            prisma.value,
            prisma.reason,
            prisma.createdByMembershipId,
            prisma.createdAt,
        );
    }

    static toPersistence(domain: Incident): PrismaIncident {
        return {
            id: domain.id,
            clubId: domain.clubId,
            membershipId: domain.membershipId,
            type: IncidentMapper.mapTypeForPrisma(domain.type),
            cycleId: domain.cycleId ?? null,
            sessionId: domain.sessionId ?? null,
            severity: domain.severity ?? null,
            value: domain.value ?? null,
            reason: domain.reason ?? null,
            createdByMembershipId: domain.createdByMembershipId ?? null,
            createdAt: new Date(),
            updatedAt: new Date(),
        } as PrismaIncident;
    }

    private static mapType(type: PrismaType): IncidentType {
        return IncidentType[type as keyof typeof IncidentType] || IncidentType.OTHER;
    }

    private static mapTypeForPrisma(type: IncidentType): PrismaType {
        return PrismaType[type as keyof typeof PrismaType];
    }
}
