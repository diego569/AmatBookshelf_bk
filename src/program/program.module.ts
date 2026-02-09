
import { Module } from '@nestjs/common';
import { CycleController } from './interfaces/cycle.controller';
import { CycleService } from './application/cycle.service';
import { PrismaCycleRepository } from './infrastructure/prisma-cycle.repository';
import { ICycleRepository } from './domain/repositories/ICycleRepository';
import { SessionController } from './interfaces/session.controller';
import { SessionService } from './application/session.service';
import { PrismaSessionRepository } from './infrastructure/prisma-session.repository';
import { ISessionRepository } from './domain/repositories/ISessionRepository';

@Module({
    imports: [],
    controllers: [CycleController, SessionController],
    providers: [
        CycleService,
        SessionService,
        {
            provide: ICycleRepository,
            useClass: PrismaCycleRepository,
        },
        {
            provide: ISessionRepository,
            useClass: PrismaSessionRepository,
        },
    ],
    exports: [CycleService, SessionService, ICycleRepository, ISessionRepository],
})
export class ProgramModule { }
