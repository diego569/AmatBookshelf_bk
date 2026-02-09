
import { Inject, Injectable } from '@nestjs/common';
import { ICycleRepository } from '../domain/repositories/ICycleRepository';
import { CreateCycleDto } from '../interfaces/dto/create-cycle.dto';
import { Cycle } from '../domain/cycle.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class CycleService {
    constructor(
        @Inject(ICycleRepository)
        private readonly cycleRepository: ICycleRepository,
    ) { }

    async create(clubId: string, dto: CreateCycleDto): Promise<Cycle> {
        const cycle = new Cycle(
            randomUUID(),
            clubId,
            dto.name,
            new Date(dto.startDate),
            dto.theme,
            dto.endDate ? new Date(dto.endDate) : null,
        );
        return this.cycleRepository.create(cycle);
    }

    async findAllByClub(clubId: string): Promise<Cycle[]> {
        return this.cycleRepository.findAllByClub(clubId);
    }
}
