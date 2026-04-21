import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { FilterPatientDto } from './dto/filter-patient.dto';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientsRepository: Repository<Patient>,
  ) {}

  async findAll(filters: FilterPatientDto) {
    const { page, limit, obraSocial, complexity, locality, search } = filters;
    const where: Record<string, unknown>[] = [];

    const base: Record<string, unknown> = {};
    if (obraSocial) base.obraSocial = obraSocial;
    if (complexity) base.complexity = complexity;
    if (locality) base.locality = ILike(`%${locality}%`);

    if (search) {
      where.push({ ...base, firstName: ILike(`%${search}%`) });
      where.push({ ...base, lastName: ILike(`%${search}%`) });
      where.push({ ...base, dni: ILike(`%${search}%`) });
    } else {
      where.push(base);
    }

    const [items, total] = await this.patientsRepository.findAndCount({
      where: where.length ? where : undefined,
      order: { lastName: 'ASC', firstName: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total, page, limit };
  }

  async findOne(id: string) {
    const patient = await this.patientsRepository.findOne({ where: { id } });
    if (!patient) throw new NotFoundException('Paciente no encontrado');
    return patient;
  }

  async create(dto: CreatePatientDto) {
    const existing = await this.patientsRepository.findOne({ where: { dni: dto.dni } });
    if (existing) throw new ConflictException('Ya existe un paciente con ese DNI');

    const patient = this.patientsRepository.create(dto);
    return this.patientsRepository.save(patient);
  }

  async update(id: string, dto: UpdatePatientDto) {
    const patient = await this.findOne(id);

    if (dto.dni && dto.dni !== patient.dni) {
      const existing = await this.patientsRepository.findOne({ where: { dni: dto.dni } });
      if (existing) throw new ConflictException('Ya existe un paciente con ese DNI');
    }

    Object.assign(patient, dto);
    return this.patientsRepository.save(patient);
  }
}
