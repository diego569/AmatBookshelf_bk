
export class Rule {
    constructor(
        public readonly id: string,
        public readonly ruleSetId: string,
        public ruleKey: string,
        public ruleValue: any, // JSON
    ) { }
}
