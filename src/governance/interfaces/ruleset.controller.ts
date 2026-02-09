
import { Body, Controller, Get, Inject, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { IRuleSetRepository } from '../domain/repositories/IRuleSetRepository';
import { CreateRuleSetDto } from './dto/create-ruleset.dto';
import { RuleSet } from '../domain/rule-set.entity';
import { Rule } from '../domain/rule.entity';

@ApiTags('Governance - Rules')
@Controller()
export class RuleSetController {
    constructor(
        @Inject(IRuleSetRepository)
        private readonly ruleSetRepository: IRuleSetRepository,
    ) { }

    @Post('clubs/:clubId/rule-sets')
    @ApiOperation({ summary: 'Create a new rule set for a club' })
    async createRuleSet(
        @Param('clubId') clubId: string,
        @Body() dto: CreateRuleSetDto,
    ) {
        const ruleSet = new RuleSet(
            crypto.randomUUID(),
            clubId,
            dto.name,
            dto.appliesTo,
            new Date(dto.effectiveFrom),
            dto.effectiveTo ? new Date(dto.effectiveTo) : undefined,
            dto.priority,
            dto.active ?? true,
            dto.rules.map(r => new Rule(crypto.randomUUID(), '', r.ruleKey, r.ruleValue))
        );

        return this.ruleSetRepository.create(ruleSet);
    }

    @Get('clubs/:clubId/rule-sets')
    @ApiOperation({ summary: 'Get all rule sets for a club' })
    @ApiQuery({ name: 'active', required: false, type: Boolean })
    async getRuleSets(
        @Param('clubId') clubId: string,
        @Query('active') active?: boolean,
    ) {
        return this.ruleSetRepository.findAllByClub(clubId, active);
    }
}
