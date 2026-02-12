import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AttendanceController } from './interfaces/attendance.controller';
import { PointsController } from './interfaces/points.controller';
import { IncidentController } from './interfaces/incident.controller';
import { RuleSetController } from './interfaces/ruleset.controller';
import { SessionController } from './interfaces/session.controller';
import { MarkAttendanceUseCase } from './application/use-cases/mark-attendance.use-case';
import { RuleEvaluatorService } from './application/services/rule-evaluator.service';
import { GovernanceListener } from './application/listeners/governance.listener';
import { QrCodeService } from './application/qr-code.service';
import { PrismaAttendanceRepository } from './infrastructure/prisma-attendance.repository';
import { IAttendanceRepository } from './domain/repositories/IAttendanceRepository';
import { PrismaIncidentRepository } from './infrastructure/prisma-incident.repository';
import { IIncidentRepository } from './domain/repositories/IIncidentRepository';
import { PrismaPointsRepository } from './infrastructure/prisma-points.repository';
import { IPointsRepository } from './domain/repositories/IPointsRepository';
import { PrismaRuleSetRepository } from './infrastructure/prisma-ruleset.repository';
import { IRuleSetRepository } from './domain/repositories/IRuleSetRepository';
import { ProgramModule } from '../program/program.module';
import { IdentityModule } from '../identity/identity.module';

@Module({
    imports: [
        ProgramModule,
        IdentityModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('QR_SECRET') || 'qr-secret-key',
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [
        AttendanceController,
        PointsController,
        IncidentController,
        RuleSetController,
        SessionController,
    ],
    providers: [
        MarkAttendanceUseCase,
        RuleEvaluatorService,
        GovernanceListener,
        QrCodeService,
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

