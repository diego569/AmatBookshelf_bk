import { Module } from '@nestjs/common';
import { AttendanceController } from './interfaces/attendance.controller';
import { PointsController } from './interfaces/points.controller';
import { IncidentController } from './interfaces/incident.controller';
import { RuleSetController } from './interfaces/ruleset.controller';
import { MarkAttendanceUseCase } from './application/use-cases/mark-attendance.use-case';
import { RuleEvaluatorService } from './application/services/rule-evaluator.service';
import { GovernanceListener } from './application/listeners/governance.listener';
import { PrismaAttendanceRepository } from './infrastructure/prisma-attendance.repository';
import { IAttendanceRepository } from './domain/repositories/IAttendanceRepository';
import { PrismaIncidentRepository } from './infrastructure/prisma-incident.repository';
import { IIncidentRepository } from './domain/repositories/IIncidentRepository';
import { PrismaPointsRepository } from './infrastructure/prisma-points.repository';
import { IPointsRepository } from './domain/repositories/IPointsRepository';
import { PrismaRuleSetRepository } from './infrastructure/prisma-ruleset.repository';
import { IRuleSetRepository } from './domain/repositories/IRuleSetRepository';
import { ProgramModule } from '../program/program.module';

@Module({
    imports: [ProgramModule],
    controllers: [
        AttendanceController,
        PointsController,
        IncidentController,
        RuleSetController,
    ],
    providers: [
        MarkAttendanceUseCase,
        RuleEvaluatorService,
        GovernanceListener,
        {
            provide: IAttendanceRepository,
            useClass: PrismaAttendanceRepository,
        },
        {
            provide: IIncidentRepository,
            useClass: PrismaIncidentRepository,
        },
        {
            provide: IPointsRepository,
            useClass: PrismaPointsRepository,
        },
        {
            provide: IRuleSetRepository,
            useClass: PrismaRuleSetRepository,
        },
    ],
    exports: [
        IAttendanceRepository,
        IIncidentRepository,
        IPointsRepository,
        IRuleSetRepository,
    ],
})
export class GovernanceModule { }

