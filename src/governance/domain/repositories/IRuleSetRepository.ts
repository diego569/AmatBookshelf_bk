
import { RuleSet } from '../rule-set.entity';

export interface IRuleSetRepository {
    create(ruleSet: RuleSet): Promise<RuleSet>;
    findActive(clubId: string, appliesTo: string, date: Date): Promise<RuleSet | null>;
    findAllByClub(clubId: string, activeOnly?: boolean): Promise<RuleSet[]>;
    findById(id: string): Promise<RuleSet | null>;
}

export const IRuleSetRepository = Symbol('IRuleSetRepository');
