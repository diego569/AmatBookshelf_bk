
import { Club as PrismaClub } from '@prisma/client';
import { Club } from '../../domain/club.entity';

export class ClubMapper {
    static toDomain(prismaClub: PrismaClub): Club {
        return new Club(
            prismaClub.id,
            prismaClub.name,
            prismaClub.mode,
            prismaClub.createdAt,
        );
    }

    static toPersistence(club: Club): PrismaClub {
        return {
            id: club.id,
            name: club.name,
            mode: club.mode ?? null,
            createdAt: club.createdAt ?? new Date(),
            updatedAt: new Date(),
        } as PrismaClub;
    }
}
