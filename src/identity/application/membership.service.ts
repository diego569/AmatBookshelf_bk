
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IMembershipRepository } from '../domain/repositories/IMembershipRepository';
import { CreateMembershipDto } from '../interfaces/dto/create-membership.dto';
import { UpdateMembershipDto } from '../interfaces/dto/update-membership.dto';
import { Membership, MemberStatus } from '../domain/membership.entity';
import { ClubService } from './club.service';
import { PersonService } from './person.service';
import { randomUUID } from 'crypto';

@Injectable()
export class MembershipService {
    constructor(
        @Inject(IMembershipRepository)
        private readonly membershipRepository: IMembershipRepository,
        private readonly clubService: ClubService,
        private readonly personService: PersonService,
    ) { }

    async create(createMembershipDto: CreateMembershipDto): Promise<Membership> {
        const { clubId, personId, role } = createMembershipDto;

        const club = await this.clubService.findOne(clubId);
        if (!club) throw new NotFoundException('Club not found');

        const person = await this.personService.findOne(personId);
        if (!person) throw new NotFoundException('Person not found');

        const existingMembership = await this.membershipRepository.findByClubAndPerson(clubId, personId);
        if (existingMembership) {
            throw new BadRequestException('Person is already an active member of this club');
        }

        const membership = new Membership(
            randomUUID(),
            clubId,
            personId,
            role,
        );
        return this.membershipRepository.create(membership);
    }

    async findAllByClub(clubId: string): Promise<Membership[]> {
        return this.membershipRepository.findAllByClub(clubId);
    }

    async findOne(id: string): Promise<Membership> {
        const membership = await this.membershipRepository.findById(id);
        if (!membership) {
            throw new NotFoundException('Membership not found');
        }
        return membership;
    }

    async update(id: string, updateDto: UpdateMembershipDto): Promise<Membership> {
        const membership = await this.membershipRepository.findById(id);
        if (!membership) {
            throw new NotFoundException('Membership not found');
        }

        if (updateDto.role) {
            membership.role = updateDto.role;
        }

        if (updateDto.status) {
            membership.status = updateDto.status;
            if (updateDto.status === MemberStatus.LEFT) {
                membership.deactivate();
            } else if (updateDto.status === MemberStatus.ACTIVE) {
                membership.leftAt = null;
            }
        }

        return this.membershipRepository.update(membership);
    }

    async findActiveByClubAndPerson(clubId: string, personId: string): Promise<Membership | null> {
        return this.membershipRepository.findByClubAndPerson(clubId, personId);
    }
}
