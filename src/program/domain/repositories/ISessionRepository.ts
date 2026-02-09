
import { Session, SessionType } from '../session.entity';

export interface ISessionRepository {
    create(session: Session): Promise<Session>;
    findById(id: string): Promise<Session | null>;
    findAllByClub(clubId: string, options?: { from?: Date; to?: Date; type?: SessionType }): Promise<Session[]>;
    update(session: Session): Promise<Session>;
}

export const ISessionRepository = Symbol('ISessionRepository');
