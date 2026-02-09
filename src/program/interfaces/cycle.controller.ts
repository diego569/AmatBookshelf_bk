
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CycleService } from '../application/cycle.service';
import { CreateCycleDto } from './dto/create-cycle.dto';

@ApiTags('cycles')
@Controller('clubs/:clubId/cycles')
export class CycleController {
    constructor(private readonly cycleService: CycleService) { }

    @Post()
    create(@Param('clubId') clubId: string, @Body() dto: CreateCycleDto) {
        return this.cycleService.create(clubId, dto);
    }

    @Get()
    findAll(@Param('clubId') clubId: string) {
        return this.cycleService.findAllByClub(clubId);
    }
}
