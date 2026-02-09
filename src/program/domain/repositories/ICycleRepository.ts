
import { Cycle } from '../cycle.entity';

export interface ICycleRepository {
    create(cycle: Cycle): Promise<Cycle>;
    findById(id: string): Promise<Cycle | null>;
    findAllByClub(clubId: string): Promise<Cycle[]>;
    update(cycle: Cycle): Promise<Cycle>;
}

export const ICycleRepository = Symbol('ICycleRepository');
