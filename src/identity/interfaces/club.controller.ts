
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ClubService } from '../application/club.service';
import { CreateClubDto } from './dto/create-club.dto';
import { MembershipService } from '../application/membership.service';

@ApiTags('clubs')
@Controller('clubs')
export class ClubController {
    constructor(
        private readonly clubService: ClubService,
        private readonly membershipService: MembershipService,
    ) { }

    @Post()
    create(@Body() createClubDto: CreateClubDto) {
        return this.clubService.create(createClubDto);
    }

    @Get()
    findAll() {
        return this.clubService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.clubService.findOne(id);
    }

    @Get(':clubId/memberships')
    findMemberships(@Param('clubId') clubId: string) {
        return this.membershipService.findAllByClub(clubId);
    }
}
