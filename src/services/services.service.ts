import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { CheckinDto } from './dto/checkin.dto';
import { FilterServiceDto } from './dto/filter-service.dto';
import { ServiceStatus } from './enums/service-status.enum';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly servicesRepository: Repository<Service>,
  ) {}

  async findAll(filters: FilterServiceDto) {
    const { page, limit, patientId, providerId, status, dateFrom, dateTo } = filters;
    const qb = this.servicesRepository
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.patient', 'patient')
      .leftJoinAndSelect('s.provider', 'provider')
      .orderBy('s.serviceDate', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (patientId) qb.andWhere('s.patientId = :patientId', { patientId });
    if (providerId) qb.andWhere('s.providerId = :providerId', { providerId });
    if (status) qb.andWhere('s.status = :status', { status });
    if (dateFrom) qb.andWhere('s.serviceDate >= :dateFrom', { dateFrom });
    if (dateTo) qb.andWhere('s.serviceDate <= :dateTo', { dateTo });

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async findOne(id: string) {
    const service = await this.servicesRepository.findOne({
      where: { id },
      relations: ['patient', 'provider', 'authorization'],
    });
    if (!service) throw new NotFoundException('Servicio no encontrado');
    return service;
  }

  async create(dto: CreateServiceDto) {
    const service = this.servicesRepository.create(dto);
    return this.servicesRepository.save(service);
  }

  async update(id: string, dto: UpdateServiceDto) {
    const service = await this.findOne(id);
    Object.assign(service, dto);
    return this.servicesRepository.save(service);
  }

  async checkin(id: string, dto: CheckinDto) {
    const service = await this.findOne(id);
    service.coordinatorCheckedIn = true;
    service.billable = true;
    service.status = ServiceStatus.CUMPLIDO;
    service.checkinTime = new Date();
    if (dto.coordinatorAction) service.coordinatorAction = dto.coordinatorAction;
    if (dto.geoLocation) service.geoLocation = dto.geoLocation;
    return this.servicesRepository.save(service);
  }
}
