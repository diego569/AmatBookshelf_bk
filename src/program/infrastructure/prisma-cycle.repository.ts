
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/infrastructure/prisma/prisma.service';
import { ICycleRepository } from '../domain/repositories/ICycleRepository';
import { Cycle } from '../domain/cycle.entity';
import { CycleMapper } from './mappers/cycle.mapper';

@Injectable()
export class PrismaCycleRepository implements ICycleRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(cycle: Cycle): Promise<Cycle> {
        const data = CycleMapper.toPersistence(cycle);
        const created = await this.prisma.cycle.create({
            data: {
                id: undefined, // Let DB generate
                clubId: data.clubId,
                name: data.name,
                startDate: data.startDate,
                endDate: data.endDate,
                theme: data.theme,
            }
        });
        return CycleMapper.toDomain(created);
    }

    async findById(id: string): Promise<Cycle | null> {
        const cycle = await this.prisma.cycle.findUnique({ where: { id } });
        if (!cycle) return null;
        return CycleMapper.toDomain(cycle);
    }

    async findAllByClub(clubId: string): Promise<Cycle[]> {
        const cycles = await this.prisma.cycle.findMany({ where: { clubId } });
        return cycles.map(CycleMapper.toDomain);
    }

    async update(cycle: Cycle): Promise<Cycle> {
        const data = CycleMapper.toPersistence(cycle);
        const updated = await this.prisma.cycle.update({
            where: { id: cycle.id },
            data: {
                name: data.name,
                theme: data.theme,
                startDate: data.startDate,
                endDate: data.endDate
            }
        });
        return CycleMapper.toDomain(updated);
    }
}
