
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ISessionRepository } from '../domain/repositories/ISessionRepository';
import { CreateSessionDto } from '../interfaces/dto/create-session.dto';
import { Session, SessionType } from '../domain/session.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class SessionService {
    constructor(
        @Inject(ISessionRepository)
        private readonly sessionRepository: ISessionRepository,
    ) { }

    async create(clubId: string, dto: CreateSessionDto): Promise<Session> {
        const session = new Session(
            randomUUID(),
            clubId,
            dto.sessionType,
            new Date(dto.startsAt),
            dto.cycleId,
            dto.endsAt ? new Date(dto.endsAt) : null,
            dto.title,
        );
        return this.sessionRepository.create(session);
    }

    async findAllByClub(clubId: string, query: { from?: string; to?: string; type?: SessionType }): Promise<Session[]> {
        const from = query.from ? new Date(query.from) : undefined;
        const to = query.to ? new Date(query.to) : undefined;
        return this.sessionRepository.findAllByClub(clubId, { ...query, from, to });
    }

    async findOne(id: string): Promise<Session> {
        const session = await this.sessionRepository.findById(id);
        if (!session) throw new NotFoundException('Session not found');
        return session;
    }
}
