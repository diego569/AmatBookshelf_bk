
import { Rule } from './rule.entity';

export class RuleSet {
    constructor(
        public readonly id: string,
        public readonly clubId: string,
        public name: string,
        public appliesTo: string,    // e.g. "ALL", "SESSION:LECTURA"
        public effectiveFrom: Date,
        public effectiveTo?: Date | null,
        public priority: number = 0,
        public active: boolean = true,
        public rules: Rule[] = [],
    ) { }

    public isActive(atDate: Date = new Date()): boolean {
        if (!this.active) return false;
        if (this.effectiveTo && atDate > this.effectiveTo) return false;
        return atDate >= this.effectiveFrom;
    }
}
