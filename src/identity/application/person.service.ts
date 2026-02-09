
import { Inject, Injectable } from '@nestjs/common';
import { IPersonRepository } from '../domain/repositories/IPersonRepository';
import { CreatePersonDto } from '../interfaces/dto/create-person.dto';
import { Person } from '../domain/person.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class PersonService {
    constructor(
        @Inject(IPersonRepository)
        private readonly personRepository: IPersonRepository,
    ) { }

    async create(createPersonDto: CreatePersonDto): Promise<Person> {
        const person = new Person(
            randomUUID(),
            createPersonDto.fullName,
            createPersonDto.email,
            createPersonDto.phone,
        );
        return this.personRepository.create(person);
    }

    async findAll(): Promise<Person[]> {
        return this.personRepository.findAll();
    }

    async findOne(id: string): Promise<Person | null> {
        return this.personRepository.findById(id);
    }
}
