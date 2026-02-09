
import { Club } from '../club.entity';

export interface IClubRepository {
    create(club: Club): Promise<Club>;
    findById(id: string): Promise<Club | null>;
    findAll(): Promise<Club[]>;
    update(club: Club): Promise<Club>;
}

export const IClubRepository = Symbol('IClubRepository');
