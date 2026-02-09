
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/infrastructure/prisma/prisma.service';
import { ISessionRepository } from '../domain/repositories/ISessionRepository';
import { Session, SessionType } from '../domain/session.entity';
import { SessionMapper } from './mappers/session.mapper';
import { SessionType as PrismaSessionType } from '@prisma/client';

@Injectable()
export class PrismaSessionRepository implements ISessionRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(session: Session): Promise<Session> {
        const data = SessionMapper.toPersistence(session);
        const created = await this.prisma.session.create({
            data: {
                id: undefined,
                clubId: data.clubId,
                cycleId: data.cycleId,
                sessionType: data.sessionType,
                startsAt: data.startsAt,
                endsAt: data.endsAt,
                title: data.title,
            }
        });
        return SessionMapper.toDomain(created);
    }

    async findById(id: string): Promise<Session | null> {
        const session = await this.prisma.session.findUnique({ where: { id } });
        if (!session) return null;
        return SessionMapper.toDomain(session);
    }

    async findAllByClub(clubId: string, options?: { from?: Date; to?: Date; type?: SessionType }): Promise<Session[]> {
        const where: any = { clubId };
        if (options?.from || options?.to) {
            where.startsAt = {};
            if (options.from) where.startsAt.gte = options.from;
            if (options.to) where.startsAt.lte = options.to;
        }
        if (options?.type) {
            // Map domain enum to prisma enum
            // Assuming strictly matched names
            where.sessionType = options.type;
        }

        const sessions = await this.prisma.session.findMany({
            where,
            orderBy: { startsAt: 'asc' }
        });
        return sessions.map(SessionMapper.toDomain);
    }

    async update(session: Session): Promise<Session> {
        const data = SessionMapper.toPersistence(session);
        const updated = await this.prisma.session.update({
            where: { id: session.id },
            data: {
                sessionType: data.sessionType,
                startsAt: data.startsAt,
                endsAt: data.endsAt,
                title: data.title,
                cycleId: data.cycleId
            }
        });
        return SessionMapper.toDomain(updated);
    }
}
