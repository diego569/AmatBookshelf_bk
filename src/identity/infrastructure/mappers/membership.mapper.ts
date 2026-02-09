
import { Membership as PrismaMembership, MemberRole as PrismaRole, MemberStatus as PrismaStatus } from '@prisma/client';
import { Membership, MemberRole, MemberStatus } from '../../domain/membership.entity';

export class MembershipMapper {
    static toDomain(prisma: PrismaMembership): Membership {
        return new Membership(
            prisma.id,
            prisma.clubId,
            prisma.personId,
            MembershipMapper.mapRole(prisma.role),
            MembershipMapper.mapStatus(prisma.status),
            prisma.joinedAt,
            prisma.leftAt,
            prisma['person'] // if included
        );
    }

    static toPersistence(domain: Membership): PrismaMembership {
        return {
            id: domain.id,
            clubId: domain.clubId,
            personId: domain.personId,
            role: MembershipMapper.mapRoleForPrisma(domain.role),
            status: MembershipMapper.mapStatusForPrisma(domain.status),
            joinedAt: domain.joinedAt,
            leftAt: domain.leftAt ?? null,
            createdAt: new Date(), // updated automatically
            updatedAt: new Date(),
        } as PrismaMembership;
    }

    private static mapRole(role: PrismaRole): MemberRole {
        return userRoleMap[role] || MemberRole.MEMBER;
    }

    private static mapStatus(status: PrismaStatus): MemberStatus {
        return userStatusMap[status] || MemberStatus.ACTIVE;
    }

    private static mapRoleForPrisma(role: MemberRole): PrismaRole {
        return prismaRoleMap[role];
    }

    private static mapStatusForPrisma(status: MemberStatus): PrismaStatus {
        return prismaStatusMap[status];
    }
}

const userRoleMap: Record<string, MemberRole> = {
    'MEMBER': MemberRole.MEMBER,
    'MODERATOR': MemberRole.MODERATOR,
    'admin': MemberRole.ADMIN,
};

const userStatusMap: Record<string, MemberStatus> = {
    'ACTIVE': MemberStatus.ACTIVE,
    'INACTIVE': MemberStatus.INACTIVE,
    'LEFT': MemberStatus.LEFT,
};

const prismaRoleMap: Record<MemberRole, PrismaRole> = {
    [MemberRole.MEMBER]: PrismaRole.MEMBER,
    [MemberRole.MODERATOR]: PrismaRole.MODERATOR,
    [MemberRole.ADMIN]: PrismaRole.admin,
};

const prismaStatusMap: Record<MemberStatus, PrismaStatus> = {
    [MemberStatus.ACTIVE]: PrismaStatus.ACTIVE,
    [MemberStatus.INACTIVE]: PrismaStatus.INACTIVE,
    [MemberStatus.LEFT]: PrismaStatus.LEFT,
};
