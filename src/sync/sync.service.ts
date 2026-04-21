import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { IntersofticClient } from './intersoftic.client';
import { SyncLog, SyncEntity, SyncStatus } from './entities/sync-log.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Provider } from '../providers/entities/provider.entity';
import { Authorization } from '../authorizations/entities/authorization.entity';
import { Service } from '../services/entities/service.entity';
import { IntakeChannel } from '../common/enums/intake-channel.enum';
import { Specialty } from '../providers/enums/specialty.enum';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    private readonly intersofticClient: IntersofticClient,
    private readonly configService: ConfigService,
    @InjectRepository(SyncLog)
    private readonly syncLogRepository: Repository<SyncLog>,
    @InjectRepository(Patient)
    private readonly patientsRepository: Repository<Patient>,
    @InjectRepository(Provider)
    private readonly providersRepository: Repository<Provider>,
    @InjectRepository(Authorization)
    private readonly authorizationsRepository: Repository<Authorization>,
    @InjectRepository(Service)
    private readonly servicesRepository: Repository<Service>,
  ) {}

  // --- CronJobs ---

  @Cron('0 * * * *', { name: 'sync-patients' })
  async syncPatientsCron() {
    await this.syncPatients('CRON');
  }

  @Cron('0 * * * *', { name: 'sync-providers' })
  async syncProvidersCron() {
    await this.syncProviders('CRON');
  }

  @Cron('0 * * * *', { name: 'sync-authorizations' })
  async syncAuthorizationsCron() {
    await this.syncAuthorizations('CRON');
  }

  @Cron('0 * * * *', { name: 'sync-services' })
  async syncServicesCron() {
    await this.syncServices('CRON');
  }

  // --- Manual trigger ---

  async triggerSync(entity: SyncEntity, triggeredBy = 'MANUAL') {
    switch (entity) {
      case SyncEntity.PATIENTS:
        return this.syncPatients(triggeredBy);
      case SyncEntity.PROVIDERS:
        return this.syncProviders(triggeredBy);
      case SyncEntity.AUTHORIZATIONS:
        return this.syncAuthorizations(triggeredBy);
      case SyncEntity.SERVICES:
        return this.syncServices(triggeredBy);
    }
  }

  async getLogs(page = 1, limit = 20) {
    const [items, total] = await this.syncLogRepository.findAndCount({
      order: { executedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit };
  }

  // --- Sync implementations ---

  private async syncPatients(triggeredBy: string) {
    this.logger.log(`Sync PATIENTS — triggered by ${triggeredBy}`);
    let created = 0;
    let updated = 0;
    let errorMessage: string | null = null;

    try {
      const records = await this.intersofticClient.getPatients();

      for (const r of records) {
        const existing = await this.patientsRepository.findOne({
          where: { intersofticId: r.id },
        });
        if (existing) {
          Object.assign(existing, {
            firstName: r.firstName,
            lastName: r.lastName,
            affiliateNumber: r.affiliateNumber,
            address: r.address ?? existing.address,
            locality: r.locality ?? existing.locality,
            geoLocation: r.geoLocation ?? existing.geoLocation,
            obraSocial: r.obraSocial ?? existing.obraSocial,
            cieDiagnosis: r.cieDiagnosis ?? existing.cieDiagnosis,
            familyContact: r.familyContact ?? existing.familyContact,
          });
          await this.patientsRepository.save(existing);
          updated++;
        } else {
          await this.patientsRepository.save(
            this.patientsRepository.create({
              intersofticId: r.id,
              firstName: r.firstName,
              lastName: r.lastName,
              dni: r.dni,
              affiliateNumber: r.affiliateNumber,
              birthDate: r.birthDate ? new Date(r.birthDate) : null,
              address: r.address ?? null,
              locality: r.locality ?? null,
              geoLocation: r.geoLocation ?? null,
              obraSocial: r.obraSocial ?? null,
              cieDiagnosis: r.cieDiagnosis ?? null,
              familyContact: r.familyContact ?? null,
              treatingDoctor: r.treatingDoctor ?? null,
              intakeChannel: IntakeChannel.INTERSOFTIC,
            }),
          );
          created++;
        }
      }
    } catch (err) {
      errorMessage = (err as Error).message;
      this.logger.error(`Sync PATIENTS failed: ${errorMessage}`);
    }

    return this.saveLog({
      entity: SyncEntity.PATIENTS,
      status: errorMessage ? SyncStatus.FAILED : SyncStatus.SUCCESS,
      recordsProcessed: created + updated,
      recordsCreated: created,
      recordsUpdated: updated,
      errorMessage,
      triggeredBy,
    });
  }

  private async syncProviders(triggeredBy: string) {
    this.logger.log(`Sync PROVIDERS — triggered by ${triggeredBy}`);
    let created = 0;
    let updated = 0;
    let errorMessage: string | null = null;

    try {
      const records = await this.intersofticClient.getProviders();

      for (const r of records) {
        const existing = await this.providersRepository.findOne({
          where: { intersofticId: r.id },
        });
        if (existing) {
          Object.assign(existing, {
            fullName: r.fullName,
            phone: r.phone ?? existing.phone,
            coverageZone: r.coverageZone ?? existing.coverageZone,
            distanceToPatient: r.distanceToPatient ?? existing.distanceToPatient,
            complianceRate: r.complianceRate ?? existing.complianceRate,
            currentWorkload: r.currentWorkload ?? existing.currentWorkload,
          });
          await this.providersRepository.save(existing);
          updated++;
        } else {
          await this.providersRepository.save(
            this.providersRepository.create({
              intersofticId: r.id,
              fullName: r.fullName,
              phone: r.phone ?? null,
              specialty: (r.specialty as Specialty) ?? Specialty.OTRO,
              coverageZone: r.coverageZone ?? null,
              distanceToPatient: r.distanceToPatient ?? null,
              complianceRate: r.complianceRate ?? null,
              currentWorkload: r.currentWorkload ?? null,
            }),
          );
          created++;
        }
      }
    } catch (err) {
      errorMessage = (err as Error).message;
      this.logger.error(`Sync PROVIDERS failed: ${errorMessage}`);
    }

    return this.saveLog({
      entity: SyncEntity.PROVIDERS,
      status: errorMessage ? SyncStatus.FAILED : SyncStatus.SUCCESS,
      recordsProcessed: created + updated,
      recordsCreated: created,
      recordsUpdated: updated,
      errorMessage,
      triggeredBy,
    });
  }

  private async syncAuthorizations(triggeredBy: string) {
    this.logger.log(`Sync AUTHORIZATIONS — triggered by ${triggeredBy}`);
    let created = 0;
    let updated = 0;
    let errorMessage: string | null = null;

    try {
      const records = await this.intersofticClient.getAuthorizations();

      for (const r of records) {
        const patient = await this.patientsRepository.findOne({
          where: { intersofticId: r.patientIntersofticId },
        });
        if (!patient) continue;

        const existing = await this.authorizationsRepository.findOne({
          where: { intersofticId: r.id },
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expDate = new Date(r.expirationDate);

        if (existing) {
          Object.assign(existing, {
            authorizationNumber: r.authorizationNumber,
            obraSocial: r.obraSocial ?? existing.obraSocial,
            osDelegacion: r.osDelegacion ?? existing.osDelegacion,
            startDate: new Date(r.startDate),
            expirationDate: expDate,
            autoCancel: r.autoCancel ?? existing.autoCancel,
            monthlyLimit: r.monthlyLimit ?? existing.monthlyLimit,
          });
          await this.authorizationsRepository.save(existing);
          updated++;

          if (expDate < today) {
            this.logger.warn(
              `Authorization ${existing.id} (${existing.authorizationNumber}) is EXPIRED — alert only, no automatic cancellation`,
            );
          }
        } else {
          await this.authorizationsRepository.save(
            this.authorizationsRepository.create({
              intersofticId: r.id,
              patientId: patient.id,
              authorizationNumber: r.authorizationNumber,
              obraSocial: r.obraSocial ?? null,
              osDelegacion: r.osDelegacion ?? null,
              startDate: new Date(r.startDate),
              expirationDate: expDate,
              autoCancel: r.autoCancel ?? false,
              monthlyLimit: r.monthlyLimit ?? null,
            }),
          );
          created++;
        }
      }
    } catch (err) {
      errorMessage = (err as Error).message;
      this.logger.error(`Sync AUTHORIZATIONS failed: ${errorMessage}`);
    }

    return this.saveLog({
      entity: SyncEntity.AUTHORIZATIONS,
      status: errorMessage ? SyncStatus.FAILED : SyncStatus.SUCCESS,
      recordsProcessed: created + updated,
      recordsCreated: created,
      recordsUpdated: updated,
      errorMessage,
      triggeredBy,
    });
  }

  private async syncServices(triggeredBy: string) {
    this.logger.log(`Sync SERVICES — triggered by ${triggeredBy}`);
    let created = 0;
    let updated = 0;
    let errorMessage: string | null = null;

    try {
      const records = await this.intersofticClient.getServices();

      for (const r of records) {
        const [patient, provider] = await Promise.all([
          this.patientsRepository.findOne({ where: { intersofticId: r.patientIntersofticId } }),
          this.providersRepository.findOne({ where: { intersofticId: r.providerIntersofticId } }),
        ]);

        if (!patient || !provider) continue;

        let authorizationId: string | null = null;
        if (r.authorizationIntersofticId) {
          const auth = await this.authorizationsRepository.findOne({
            where: { intersofticId: r.authorizationIntersofticId },
          });
          authorizationId = auth?.id ?? null;
        }

        const existing = await this.servicesRepository.findOne({
          where: { intersofticId: r.id },
        });

        if (existing) {
          Object.assign(existing, {
            prestationNumber: r.prestationNumber,
            serviceDate: new Date(r.serviceDate),
            assignedSpecialty: r.assignedSpecialty ?? existing.assignedSpecialty,
            shift: r.shift ?? existing.shift,
          });
          await this.servicesRepository.save(existing);
          updated++;
        } else {
          await this.servicesRepository.save(
            this.servicesRepository.create({
              intersofticId: r.id,
              prestationNumber: r.prestationNumber,
              patientId: patient.id,
              providerId: provider.id,
              authorizationId,
              serviceDate: new Date(r.serviceDate),
              assignedSpecialty: r.assignedSpecialty ?? null,
              shift: r.shift ?? null,
              intakeChannel: IntakeChannel.INTERSOFTIC,
            }),
          );
          created++;
        }
      }
    } catch (err) {
      errorMessage = (err as Error).message;
      this.logger.error(`Sync SERVICES failed: ${errorMessage}`);
    }

    return this.saveLog({
      entity: SyncEntity.SERVICES,
      status: errorMessage ? SyncStatus.FAILED : SyncStatus.SUCCESS,
      recordsProcessed: created + updated,
      recordsCreated: created,
      recordsUpdated: updated,
      errorMessage,
      triggeredBy,
    });
  }

  private async saveLog(data: Partial<SyncLog>) {
    const log = this.syncLogRepository.create(data);
    return this.syncLogRepository.save(log);
  }
}
