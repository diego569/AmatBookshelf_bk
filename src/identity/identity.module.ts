
import { Module } from '@nestjs/common';
import { ClubController } from './interfaces/club.controller';
import { ClubService } from './application/club.service';
import { PrismaClubRepository } from './infrastructure/prisma-club.repository';
import { IClubRepository } from './domain/repositories/IClubRepository';
import { PersonController } from './interfaces/person.controller';
import { PersonService } from './application/person.service';
import { PrismaPersonRepository } from './infrastructure/prisma-person.repository';
import { IPersonRepository } from './domain/repositories/IPersonRepository';
import { MembershipController } from './interfaces/membership.controller';
import { MembershipService } from './application/membership.service';
import { PrismaMembershipRepository } from './infrastructure/prisma-membership.repository';
import { IMembershipRepository } from './domain/repositories/IMembershipRepository';
import { AuthModule } from './infrastructure/auth/auth.module';

@Module({
    imports: [AuthModule],
    controllers: [ClubController, PersonController, MembershipController],
    providers: [
        ClubService,
        PersonService,
        MembershipService,
        {
            provide: IClubRepository,
            useClass: PrismaClubRepository,
        },
        {
            provide: IPersonRepository,
            useClass: PrismaPersonRepository,
        },
        {
            provide: IMembershipRepository,
            useClass: PrismaMembershipRepository,
        },
    ],
    exports: [
        ClubService,
        PersonService,
        MembershipService,
        IClubRepository,
        IPersonRepository,
        IMembershipRepository,
    ],
})
export class IdentityModule { }
