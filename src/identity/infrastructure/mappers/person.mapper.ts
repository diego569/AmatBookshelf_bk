
import { Person as PrismaPerson } from '@prisma/client';
import { Person } from '../../domain/person.entity';

export class PersonMapper {
    static toDomain(prismaPerson: PrismaPerson): Person {
        return new Person(
            prismaPerson.id,
            prismaPerson.fullName,
            prismaPerson.email,
            prismaPerson.phone,
            prismaPerson.createdAt,
        );
    }

    static toPersistence(person: Person): PrismaPerson {
        return {
            id: person.id,
            fullName: person.fullName,
            email: person.email ?? null,
            phone: person.phone ?? null,
            createdAt: person.createdAt ?? new Date(),
            updatedAt: new Date(),
        } as PrismaPerson;
    }
}
