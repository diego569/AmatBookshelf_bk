
import { Person } from '../person.entity';

export interface IPersonRepository {
    create(person: Person): Promise<Person>;
    findById(id: string): Promise<Person | null>;
    findAll(): Promise<Person[]>;
    update(person: Person): Promise<Person>;
}

export const IPersonRepository = Symbol('IPersonRepository');
