
import { RuleSet as PrismaRuleSet, Rule as PrismaRule } from '@prisma/client';
import { RuleSet } from '../../domain/rule-set.entity';
import { Rule } from '../../domain/rule.entity';

export class RuleSetMapper {
    static toDomain(prisma: PrismaRuleSet & { rules?: PrismaRule[] }): RuleSet {
        return new RuleSet(
            prisma.id,
            prisma.clubId,
            prisma.name,
            prisma.appliesTo,
            prisma.effectiveFrom,
            prisma.effectiveTo,
            prisma.priority,
            prisma.active,
            prisma.rules ? prisma.rules.map(RuleSetMapper.toDomainRule) : [],
        );
    }

    static toDomainRule(prisma: PrismaRule): Rule {
        return new Rule(
            prisma.id,
            prisma.ruleSetId,
            prisma.ruleKey,
            prisma.ruleValue,
        );
    }

    static toPersistence(domain: RuleSet): PrismaRuleSet {
        return {
            id: domain.id,
            clubId: domain.clubId,
            name: domain.name,
            appliesTo: domain.appliesTo,
            effectiveFrom: domain.effectiveFrom,
            effectiveTo: domain.effectiveTo ?? null,
            priority: domain.priority,
            active: domain.active,
            createdAt: new Date(),
            updatedAt: new Date(),
        } as PrismaRuleSet;
    }
}
