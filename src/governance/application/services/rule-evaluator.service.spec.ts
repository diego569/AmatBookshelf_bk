
import { RuleEvaluatorService } from './rule-evaluator.service';
import { RuleSet } from '../../domain/rule-set.entity';
import { Rule } from '../../domain/rule.entity';
import { AttendanceRecord, AttendanceStatus } from '../../domain/attendance-record.entity';
import { IncidentType } from '../../domain/incident.entity';

describe('RuleEvaluatorService', () => {
    let service: RuleEvaluatorService;

    beforeEach(() => {
        service = new RuleEvaluatorService();
    });

    const createMockRuleSet = (rules: { key: string; value: any }[]) => {
        return new RuleSet(
            'ruleset-1',
            'club-1',
            'Test RuleSet',
            'ALL',
            new Date(),
            undefined,
            0,
            true,
            rules.map(r => new Rule('r1', 'ruleset-1', r.key, r.value))
        );
    };

    it('should grant points for presence', () => {
        const ruleSet = createMockRuleSet([
            { key: 'session_attendance_points', value: { points: 10 } }
        ]);
        const record = new AttendanceRecord('a1', 's1', 'm1', AttendanceStatus.PRESENT, 0);

        const result = service.evaluate(ruleSet, record);

        expect(result.points).toBe(10);
        expect(result.incidents).toHaveLength(0);
    });

    it('should apply late penalty and fine when over threshold', () => {
        const ruleSet = createMockRuleSet([
            { key: 'late_threshold_minutes', value: { minutes: 5 } },
            { key: 'late_points_penalty', value: { points: -2 } },
            { key: 'late_fine_amount', value: { amount: 5, currency: 'PEN' } },
            { key: 'session_attendance_points', value: { points: 10 } }
        ]);
        const record = new AttendanceRecord('a1', 's1', 'm1', AttendanceStatus.PRESENT, 10);

        const result = service.evaluate(ruleSet, record);

        expect(result.points).toBe(8); // 10 - 2
        expect(result.incidents).toContainEqual(expect.objectContaining({ type: IncidentType.LATE }));
        expect(result.incidents).toContainEqual(expect.objectContaining({ type: IncidentType.FINE }));
    });

    it('should not apply late penalty when under threshold', () => {
        const ruleSet = createMockRuleSet([
            { key: 'late_threshold_minutes', value: { minutes: 15 } },
            { key: 'late_points_penalty', value: { points: -2 } },
            { key: 'session_attendance_points', value: { points: 10 } }
        ]);
        const record = new AttendanceRecord('a1', 's1', 'm1', AttendanceStatus.PRESENT, 10);

        const result = service.evaluate(ruleSet, record);

        expect(result.points).toBe(10);
        expect(result.incidents).toHaveLength(0);
    });

    it('should create NO_SHOW incident for absent status', () => {
        const ruleSet = createMockRuleSet([]);
        const record = new AttendanceRecord('a1', 's1', 'm1', AttendanceStatus.ABSENT, 0);

        const result = service.evaluate(ruleSet, record);

        expect(result.points).toBe(0);
        expect(result.incidents).toContainEqual(expect.objectContaining({ type: IncidentType.NO_SHOW }));
    });

    it('should create STRIKE incident for absent status if rule is enabled', () => {
        const ruleSet = createMockRuleSet([
            { key: 'coordination_absence_strike', value: { enabled: true } }
        ]);
        const record = new AttendanceRecord('a1', 's1', 'm1', AttendanceStatus.ABSENT, 0);

        const result = service.evaluate(ruleSet, record);

        expect(result.incidents).toContainEqual(expect.objectContaining({ type: IncidentType.STRIKE }));
        expect(result.incidents).toContainEqual(expect.objectContaining({ type: IncidentType.NO_SHOW }));
    });
});
