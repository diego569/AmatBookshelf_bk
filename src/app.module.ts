import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IdentityModule } from './identity/identity.module';
import { ProgramModule } from './program/program.module';
import { GovernanceModule } from './governance/governance.module';
import { SharedModule } from './shared/shared.module';
import { AppContextController } from './app-context.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    IdentityModule,
    ProgramModule,
    GovernanceModule,
    SharedModule
  ],
  controllers: [AppController, AppContextController],
  providers: [AppService],
})
export class AppModule { }
