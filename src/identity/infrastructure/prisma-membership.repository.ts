
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/infrastructure/prisma/prisma.service';
import { IMembershipRepository } from '../domain/repositories/IMembershipRepository';
import { Membership } from '../domain/membership.entity';
import { MembershipMapper } from './mappers/membership.mapper';

@Injectable()
export class PrismaMembershipRepository implements IMembershipRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(membership: Membership): Promise<Membership> {
        const data = MembershipMapper.toPersistence(membership);
        const created = await this.prisma.membership.create({
            data: {
                id: undefined, // Let DB generate UUID
                clubId: data.clubId,
                personId: data.personId,
                role: data.role,
                status: data.status,
                joinedAt: data.joinedAt,
                leftAt: data.leftAt,
            }
        });
        return MembershipMapper.toDomain(created);
    }

    async findById(id: string): Promise<Membership | null> {
        const membership = await this.prisma.membership.findUnique({
            where: { id },
            include: { person: true }
        });
        if (!membership) return null;
        return MembershipMapper.toDomain(membership);
    }

    async findByClubAndPerson(clubId: string, personId: string): Promise<Membership | null> {
        const membership = await this.prisma.membership.findFirst({
            where: {
                clubId,
                personId,
                leftAt: null, // Only active membership
            },
        });
        if (!membership) return null;
        return MembershipMapper.toDomain(membership);
    }

    async findAllByClub(clubId: string): Promise<Membership[]> {
        const memberships = await this.prisma.membership.findMany({
            where: {
                clubId,
                leftAt: null,
            },
            include: {
                person: true,
            }
        });
        // With include person, our mapper needs to handle person property if we want to return full details.
        // My entity has `person?: any`. I rely on implicit structure or defined `Person` entity inside.
        // For now, let's just map the membership fields.
        return memberships.map(m => MembershipMapper.toDomain(m));
    }

    async update(membership: Membership): Promise<Membership> {
        const data = MembershipMapper.toPersistence(membership);
        const updated = await this.prisma.membership.update({
            where: { id: membership.id },
            data: {
                role: data.role,
                status: data.status,
                leftAt: data.leftAt,
            },
        });
        return MembershipMapper.toDomain(updated);
    }
}
