
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PersonService } from '../application/person.service';
import { CreatePersonDto } from './dto/create-person.dto';

@ApiTags('people')
@Controller('people')
export class PersonController {
    constructor(private readonly personService: PersonService) { }

    @Post()
    create(@Body() createPersonDto: CreatePersonDto) {
        return this.personService.create(createPersonDto);
    }

    @Get()
    findAll() {
        return this.personService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.personService.findOne(id);
    }
}
