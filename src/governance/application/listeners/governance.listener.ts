
import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AttendanceMarkedEvent } from '../../domain/events/attendance-marked.event';
import { IRuleSetRepository } from '../../domain/repositories/IRuleSetRepository';
import { IPointsRepository } from '../../domain/repositories/IPointsRepository';
import { IIncidentRepository } from '../../domain/repositories/IIncidentRepository';
import { ISessionRepository } from '../../../program/domain/repositories/ISessionRepository';
import { RuleEvaluatorService } from '../services/rule-evaluator.service';
import { PointsAccount } from '../../domain/points-account.entity';
import { PointsTransaction } from '../../domain/points-transaction.entity';
import { Incident } from '../../domain/incident.entity';

@Injectable()
export class GovernanceListener {
    private readonly logger = new Logger(GovernanceListener.name);

    constructor(
        @Inject(IRuleSetRepository)
        private readonly ruleSetRepository: IRuleSetRepository,
        @Inject(IPointsRepository)
        private readonly pointsRepository: IPointsRepository,
        @Inject(IIncidentRepository)
        private readonly incidentRepository: IIncidentRepository,
        @Inject(ISessionRepository)
        private readonly sessionRepository: ISessionRepository,
        private readonly ruleEvaluator: RuleEvaluatorService,
    ) { }

    @OnEvent('attendance.marked', { async: true })
    async handleAttendanceMarked(event: AttendanceMarkedEvent) {
        const { clubId, sessionId, record } = event;

        try {
            // 1. Fetch Session to get its type and cycle
            const session = await this.sessionRepository.findById(sessionId);
            if (!session) return;

            // 2. Find active RuleSet
            const appliesTo = `SESSION:${session.sessionType}`;
            const ruleSet = await this.ruleSetRepository.findActive(clubId, appliesTo, new Date());
            if (!ruleSet) {
                this.logger.warn(`No active RuleSet found for club ${clubId} and appliesTo ${appliesTo}`);
                return;
            }

            // 3. Evaluate Rules
            const evaluation = this.ruleEvaluator.evaluate(ruleSet, record);

            // 4. Handle Points
            if (evaluation.points !== 0) {
                let account = await this.pointsRepository.findAccount(clubId, record.membershipId, session.cycleId);
                if (!account) {
                    account = await this.pointsRepository.createAccount(
                        new PointsAccount(crypto.randomUUID(), clubId, record.membershipId, session.cycleId)
                    );
                }

                await this.pointsRepository.addTransaction(
                    new PointsTransaction(
                        crypto.randomUUID(),
                        account.id,
                        evaluation.points,
                        'RULE',
                        ruleSet.id,
                        `Points from rule evaluation for session ${session.title || sessionId}`
                    )
                );
            }

            // 5. Handle Incidents
            for (const item of evaluation.incidents) {
                // To maintain idempotency, we could check if similar incident already exists for this session+member+type
                const existing = await this.incidentRepository.findBySessionAndMembershipAndType(
                    sessionId,
                    record.membershipId,
                    item.type
                );

                if (!existing) {
                    await this.incidentRepository.create(
                        new Incident(
                            crypto.randomUUID(),
                            clubId,
                            record.membershipId,
                            item.type,
                            session.cycleId,
                            sessionId,
                            item.severity,
                            item.value,
                            item.reason,
                            undefined, // CreatedBy (system)
                            new Date()
                        )
                    );
                }
            }
        } catch (error) {
            this.logger.error(`Error processing governance for attendance ${record.id}: ${error.message}`, error.stack);
        }
    }
}
