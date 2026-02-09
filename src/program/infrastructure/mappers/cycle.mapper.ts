
import { Cycle as PrismaCycle } from '@prisma/client';
import { Cycle } from '../../domain/cycle.entity';

export class CycleMapper {
    static toDomain(prisma: PrismaCycle): Cycle {
        return new Cycle(
            prisma.id,
            prisma.clubId,
            prisma.name,
            prisma.startDate,
            prisma.theme,
            prisma.endDate,
            prisma.createdAt,
        );
    }

    static toPersistence(domain: Cycle): PrismaCycle {
        return {
            id: domain.id,
            clubId: domain.clubId,
            name: domain.name,
            startDate: domain.startDate,
            theme: domain.theme ?? null,
            endDate: domain.endDate ?? null,
            createdAt: new Date(), // Managed by Prisma/default
            updatedAt: new Date(),
        } as PrismaCycle;
    }
}
