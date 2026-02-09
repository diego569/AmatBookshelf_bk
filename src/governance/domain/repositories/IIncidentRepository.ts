
import { Incident } from '../incident.entity';

export interface IIncidentRepository {
    create(incident: Incident): Promise<Incident>;
    findAllByClub(clubId: string, options?: any): Promise<Incident[]>;
    findBySessionAndMembershipAndType(sessionId: string, membershipId: string, type: string): Promise<Incident | null>;
}

export const IIncidentRepository = Symbol('IIncidentRepository');
