import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyncLog } from './entities/sync-log.entity';
import { SyncService } from './sync.service';
import { SyncController } from './sync.controller';
import { IntersofticClient } from './intersoftic.client';
import { Patient } from '../patients/entities/patient.entity';
import { Provider } from '../providers/entities/provider.entity';
import { Authorization } from '../authorizations/entities/authorization.entity';
import { Service } from '../services/entities/service.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SyncLog, Patient, Provider, Authorization, Service]),
  ],
  providers: [SyncService, IntersofticClient],
  controllers: [SyncController],
})
export class SyncModule {}
