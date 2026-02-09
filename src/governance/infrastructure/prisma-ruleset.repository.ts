
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/infrastructure/prisma/prisma.service';
import { IRuleSetRepository } from '../domain/repositories/IRuleSetRepository';
import { RuleSet } from '../domain/rule-set.entity';
import { RuleSetMapper } from './mappers/ruleset.mapper';

@Injectable()
export class PrismaRuleSetRepository implements IRuleSetRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(ruleSet: RuleSet): Promise<RuleSet> {
        const data = RuleSetMapper.toPersistence(ruleSet);

        // We need to create rules as well if they exist in domain entity.
        // Domain entity has public rules: Rule[] = [].

        const created = await this.prisma.ruleSet.create({
            data: {
                id: undefined,
                clubId: data.clubId,
                name: data.name,
                appliesTo: data.appliesTo,
                effectiveFrom: data.effectiveFrom,
                effectiveTo: data.effectiveTo,
                priority: data.priority,
                active: data.active,
                rules: {
                    create: ruleSet.rules.map(r => ({
                        id: undefined, // let generate
                        ruleKey: r.ruleKey,
                        ruleValue: r.ruleValue,
                    }))
                }
            },
            include: { rules: true }
        });
        return RuleSetMapper.toDomain(created);
    }

    async findActive(clubId: string, appliesTo: string, date: Date): Promise<RuleSet | null> {
        // Find active rulesets for club, matching appliesTo, date range.
        // effectiveFrom <= date AND (effectiveTo >= date OR effectiveTo IS NULL)
        // sort by priority desc, take 1.

        const ruleSet = await this.prisma.ruleSet.findFirst({
            where: {
                clubId,
                appliesTo, // Do we want exact match? Or inclusive?
                // Requirement says "applies_to (session type/all)".
                // If appliesTo is "ALL", it might apply to everything.
                // Logic: find matches either specific type OR "ALL".
                // Prisma OR:
                // OR: [ { appliesTo }, { appliesTo: 'ALL' } ]
                // AND active = true
                // AND effectiveFrom <= date
                // AND (effectiveTo >= date OR effectiveTo is null)

                OR: [
                    { appliesTo },
                    { appliesTo: 'ALL' }
                ],
                active: true,
                effectiveFrom: { lte: date },
                // effectiveTo: { gte: date } OR null logic...
                // Prisma AND with OR inside for effectiveTo.
                AND: {
                    OR: [
                        { effectiveTo: { gte: date } },
                        { effectiveTo: null }
                    ]
                }
            },
            orderBy: { priority: 'desc' },
            include: { rules: true }
        });

        if (!ruleSet) return null;
        return RuleSetMapper.toDomain(ruleSet);
    }

    async findAllByClub(clubId: string, activeOnly: boolean = false): Promise<RuleSet[]> {
        const where: any = { clubId };
        if (activeOnly) where.active = true;

        const ruleSets = await this.prisma.ruleSet.findMany({
            where,
            orderBy: { effectiveFrom: 'desc' },
            include: { rules: true }
        });
        return ruleSets.map(RuleSetMapper.toDomain);
    }

    async findById(id: string): Promise<RuleSet | null> {
        const ruleSet = await this.prisma.ruleSet.findUnique({
            where: { id },
            include: { rules: true }
        });
        if (!ruleSet) return null;
        return RuleSetMapper.toDomain(ruleSet);
    }
}
