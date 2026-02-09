
import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MembershipService } from '../application/membership.service';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';

@ApiTags('memberships')
@Controller('memberships')
export class MembershipController {
    constructor(private readonly membershipService: MembershipService) { }

    @Post()
    create(@Body() createDto: CreateMembershipDto) {
        return this.membershipService.create(createDto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateDto: UpdateMembershipDto) {
        return this.membershipService.update(id, updateDto);
    }

    // GET /memberships/:membershipId/attendance in Governance
    // GET /memberships/:membershipId/points in Governance
}
