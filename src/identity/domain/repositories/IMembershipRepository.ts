
import { Membership } from '../membership.entity';

export interface IMembershipRepository {
    create(membership: Membership): Promise<Membership>;
    findByClubAndPerson(clubId: string, personId: string): Promise<Membership | null>;
    findById(id: string): Promise<Membership | null>;
    findAllByClub(clubId: string): Promise<Membership[]>;
    findByPersonId(personId: string): Promise<Membership[]>;
    update(membership: Membership): Promise<Membership>;
}

export const IMembershipRepository = Symbol('IMembershipRepository');
