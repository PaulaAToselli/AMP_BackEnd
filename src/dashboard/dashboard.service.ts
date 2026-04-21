import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../patients/entities/patient.entity';
import { Service } from '../services/entities/service.entity';
import { ServiceStatus } from '../services/enums/service-status.enum';
import { Complexity } from '../patients/enums/complexity.enum';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientsRepository: Repository<Patient>,
    @InjectRepository(Service)
    private readonly servicesRepository: Repository<Service>,
  ) {}

  async getKpis() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      activePatients,
      criticalPatients,
      pendingToday,
      completedThisMonth,
      nonCompliant,
      billableThisMonth,
      totalThisMonth,
    ] = await Promise.all([
      this.patientsRepository.count({ where: { isActive: true } }),

      this.patientsRepository.count({
        where: [
          { isActive: true, complexity: Complexity.JUDICIAL },
          { isActive: true, complexity: Complexity.VEINTICUATRO_HS },
        ],
      }),

      this.servicesRepository.count({
        where: {
          status: ServiceStatus.PENDIENTE,
        },
      }),

      this.servicesRepository
        .createQueryBuilder('s')
        .where('s.status = :status', { status: ServiceStatus.CUMPLIDO })
        .andWhere('s.serviceDate >= :from', { from: firstOfMonth })
        .getCount(),

      this.servicesRepository.count({
        where: { status: ServiceStatus.NO_CUMPLIDO },
      }),

      this.servicesRepository
        .createQueryBuilder('s')
        .where('s.billable = true')
        .andWhere('s.serviceDate >= :from', { from: firstOfMonth })
        .getCount(),

      this.servicesRepository
        .createQueryBuilder('s')
        .where('s.serviceDate >= :from', { from: firstOfMonth })
        .getCount(),
    ]);

    const appCheckinRate =
      totalThisMonth > 0
        ? Math.round((billableThisMonth / totalThisMonth) * 100)
        : 0;

    return {
      activePatients,
      criticalPatients,
      pendingToday,
      completedThisMonth,
      nonCompliant,
      appCheckinRate,
    };
  }
}
