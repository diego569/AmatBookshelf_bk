
import { Injectable, Logger } from '@nestjs/common';
import { RuleSet } from '../../domain/rule-set.entity';
import { AttendanceRecord, AttendanceStatus } from '../../domain/attendance-record.entity';
import { IncidentType } from '../../domain/incident.entity';

export interface RuleEvaluationResult {
    points: number;
    incidents: {
        type: IncidentType;
        severity?: number;
        reason: string;
        value?: any;
    }[];
}

@Injectable()
export class RuleEvaluatorService {
    private readonly logger = new Logger(RuleEvaluatorService.name);

    evaluate(ruleSet: RuleSet, record: AttendanceRecord): RuleEvaluationResult {
        const result: RuleEvaluationResult = {
            points: 0,
            incidents: [],
        };

        const rulesMap = new Map(ruleSet.rules.map(r => [r.ruleKey, r.ruleValue]));

        // 1. Base Attendance Points
        if (record.status === AttendanceStatus.PRESENT) {
            const pointsRule = rulesMap.get('session_attendance_points');
            if (pointsRule && typeof pointsRule.points === 'number') {
                result.points += pointsRule.points;
            }
        }

        // 2. Lateness Logic
        if (record.status === AttendanceStatus.PRESENT && record.minutesLate > 0) {
            const thresholdRule = rulesMap.get('late_threshold_minutes');
            const threshold = (thresholdRule && typeof thresholdRule.minutes === 'number') ? thresholdRule.minutes : 0;

            if (record.minutesLate > threshold) {
                // Apply late penalty
                const penaltyRule = rulesMap.get('late_points_penalty');
                if (penaltyRule && typeof penaltyRule.points === 'number') {
                    result.points += penaltyRule.points; // Assume penalty is negative in config or subtract here
                }

                // Create late incident
                result.incidents.push({
                    type: IncidentType.LATE,
                    severity: 1,
                    reason: `Late by ${record.minutesLate} minutes (threshold: ${threshold})`,
                    value: { minutesLate: record.minutesLate },
                });

                // Apply late fine
                const fineRule = rulesMap.get('late_fine_amount');
                if (fineRule && typeof fineRule.amount === 'number') {
                    result.incidents.push({
                        type: IncidentType.FINE,
                        severity: 2,
                        reason: `Fine for being late by ${record.minutesLate} minutes`,
                        value: { amount: fineRule.amount, currency: fineRule.currency || 'PEN' },
                    });
                }
            }
        }

        // 3. Absence Logic
        if (record.status === AttendanceStatus.ABSENT) {
            const strikeRule = rulesMap.get('coordination_absence_strike');
            // This rule might only apply to COORDINACION sessions, but RuleSet filtering handled appliesTo.
            if (strikeRule && strikeRule.enabled === true) {
                result.incidents.push({
                    type: IncidentType.STRIKE,
                    severity: 3,
                    reason: 'Unexcused absence in coordination session',
                });
            }

            result.incidents.push({
                type: IncidentType.NO_SHOW,
                severity: 2,
                reason: 'Unexcused absence',
            });
        }

        return result;
    }
}
