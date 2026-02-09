
import { Inject, Injectable } from '@nestjs/common';
import { IClubRepository } from '../domain/repositories/IClubRepository';
import { CreateClubDto } from '../interfaces/dto/create-club.dto';
import { Club } from '../domain/club.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class ClubService {
    constructor(
        @Inject(IClubRepository)
        private readonly clubRepository: IClubRepository,
    ) { }

    async create(createClubDto: CreateClubDto): Promise<Club> {
        const club = new Club(
            randomUUID(),
            createClubDto.name,
            createClubDto.mode,
            new Date(),
        );
        return this.clubRepository.create(club);
    }

    async findAll(): Promise<Club[]> {
        return this.clubRepository.findAll();
    }

    async findOne(id: string): Promise<Club | null> {
        return this.clubRepository.findById(id);
    }
}
