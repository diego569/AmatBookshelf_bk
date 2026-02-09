
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/infrastructure/prisma/prisma.service';
import { IIncidentRepository } from '../domain/repositories/IIncidentRepository';
import { Incident } from '../domain/incident.entity';
import { IncidentMapper } from './mappers/incident.mapper';

@Injectable()
export class PrismaIncidentRepository implements IIncidentRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(incident: Incident): Promise<Incident> {
        const data = IncidentMapper.toPersistence(incident);
        const created = await this.prisma.incident.create({
            data: {
                id: undefined, // default uuid
                clubId: data.clubId,
                membershipId: data.membershipId,
                type: data.type,
                cycleId: data.cycleId,
                sessionId: data.sessionId,
                severity: data.severity,
                value: data.value as any,
                reason: data.reason,
                createdByMembershipId: data.createdByMembershipId,
            }
        }); // Lint says id is missing but it's optional in create if default?
        // Actually in Prisma Client types, if it has default, it is optional.
        return IncidentMapper.toDomain(created);
    }

    async findAllByClub(clubId: string, options?: any): Promise<Incident[]> {
        const where: any = { clubId };
        if (options?.from || options?.to) {
            where.createdAt = {};
            if (options.from) where.createdAt.gte = options.from;
            if (options.to) where.createdAt.lte = options.to;
        }
        if (options?.type) {
            where.type = options.type;
        }
        if (options?.membershipId) {
            where.membershipId = options.membershipId;
        }

        const incidents = await this.prisma.incident.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });
        return incidents.map(IncidentMapper.toDomain);
    }

    async findBySessionAndMembershipAndType(sessionId: string, membershipId: string, type: string): Promise<Incident | null> {
        // This is tricky because type is string but Prisma expects enum.
        // We need to cast or map strictly.
        // IncidentMapper has logic? No, exposed as static.
        // Let's assume type is valid enum string mostly.

        // We can't query by non-unique fields easily with findUnique/First efficiently without index
        // Note: Schema doesn't enforce unique incidents per session+member+type.
        // Business logic might differ. We return the first one found if exists.

        const incident = await this.prisma.incident.findFirst({
            where: {
                sessionId,
                membershipId,
                type: type as any, // Cast to enum
            }
        });
        if (!incident) return null;
        return IncidentMapper.toDomain(incident);
    }
}
