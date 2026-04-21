import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from '../patients/entities/patient.entity';
import { Service } from '../services/entities/service.entity';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Patient, Service])],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
