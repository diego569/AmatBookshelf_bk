
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ISessionRepository } from '../domain/repositories/ISessionRepository';
import { CreateSessionDto } from '../interfaces/dto/create-session.dto';
import { UpdateSessionDto } from '../interfaces/dto/update-session.dto';
import { Session, SessionStatus, SessionType } from '../domain/session.entity';
import { randomUUID } from 'crypto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SessionService {
    private static readonly DEFAULT_SESSION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours
    private static readonly LIVE_SESSION_GRACE_MS = 60 * 60 * 1000; // +1 hour grace

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
            SessionStatus.SCHEDULED,
            dto.cycleId,
            dto.endsAt ? new Date(dto.endsAt) : null,
            null,
            null,
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

    async findLiveByClub(clubId: string): Promise<Session | null> {
        const liveSession = await this.sessionRepository.findLiveByClub(clubId);
        if (!liveSession) return null;

        if (this.shouldAutoEndLiveSession(liveSession)) {
            liveSession.status = SessionStatus.ENDED;
            liveSession.endedAt = new Date();
            await this.sessionRepository.update(liveSession);
            return null;
        }

        return liveSession;
    }

    async start(id: string): Promise<Session> {
        const session = await this.findOne(id);
        let currentLive = await this.sessionRepository.findLiveByClub(session.clubId);

        if (currentLive && currentLive.id !== session.id && this.shouldAutoEndLiveSession(currentLive)) {
            currentLive.status = SessionStatus.ENDED;
            currentLive.endedAt = new Date();
            await this.sessionRepository.update(currentLive);
            currentLive = null;
        }

        if (currentLive && currentLive.id !== session.id) {
            throw new BadRequestException('Another session is already live for this club');
        }

        if (session.status === SessionStatus.LIVE) {
            return session;
        }

        session.status = SessionStatus.LIVE;
        session.startedAt = session.startedAt ?? new Date();
        session.endedAt = null;

        return this.sessionRepository.update(session);
    }

    async end(id: string): Promise<Session> {
        const session = await this.findOne(id);

        if (session.status === SessionStatus.ENDED) {
            return session;
        }

        session.status = SessionStatus.ENDED;
        session.startedAt = session.startedAt ?? new Date();
        session.endedAt = new Date();

        return this.sessionRepository.update(session);
    }

    private shouldAutoEndLiveSession(session: Session): boolean {
        if (session.status !== SessionStatus.LIVE) return false;

        const anchorStart = session.startedAt ?? session.startsAt;
        const plannedEnd = session.endsAt
            ? session.endsAt.getTime()
            : anchorStart.getTime() + SessionService.DEFAULT_SESSION_DURATION_MS;
        const maxLiveUntil = plannedEnd + SessionService.LIVE_SESSION_GRACE_MS;

        return Date.now() > maxLiveUntil;
    }

    async update(id: string, dto: UpdateSessionDto): Promise<Session> {
        const session = await this.sessionRepository.findById(id);
        if (!session) throw new NotFoundException('Session not found');

        if (dto.sessionType !== undefined) session.sessionType = dto.sessionType;
        if (dto.startsAt !== undefined) session.startsAt = new Date(dto.startsAt);
        if (dto.endsAt !== undefined) session.endsAt = dto.endsAt ? new Date(dto.endsAt) : null;
        if (dto.title !== undefined) session.title = dto.title;
        if (dto.cycleId !== undefined) session.cycleId = dto.cycleId;

        return this.sessionRepository.update(session);
    }

    async remove(id: string): Promise<void> {
        const session = await this.sessionRepository.findById(id);
        if (!session) throw new NotFoundException('Session not found');

        try {
            await this.sessionRepository.delete(id);
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
                throw new BadRequestException('Cannot delete session with related attendance or incidents');
            }
            throw error;
        }
    }
}
