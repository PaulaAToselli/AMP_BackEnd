import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Between, Repository } from 'typeorm';
import { Authorization } from './entities/authorization.entity';
import { CreateAuthorizationDto } from './dto/create-authorization.dto';
import { UpdateAuthorizationDto } from './dto/update-authorization.dto';
import { FilterAuthorizationDto } from './dto/filter-authorization.dto';

@Injectable()
export class AuthorizationsService {
  constructor(
    @InjectRepository(Authorization)
    private readonly authorizationsRepository: Repository<Authorization>,
  ) {}

  async findAll(filters: FilterAuthorizationDto) {
    const { page, limit, patientId, obraSocial, expired, expiringSoon } = filters;
    const qb = this.authorizationsRepository
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.patient', 'patient')
      .orderBy('a.expirationDate', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    if (patientId) qb.andWhere('a.patientId = :patientId', { patientId });
    if (obraSocial) qb.andWhere('a.obraSocial = :obraSocial', { obraSocial });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (expired === true) {
      qb.andWhere('a.expirationDate < :today', { today });
    }

    if (expiringSoon === true) {
      const in30days = new Date(today);
      in30days.setDate(in30days.getDate() + 30);
      qb.andWhere('a.expirationDate >= :today AND a.expirationDate <= :in30days', {
        today,
        in30days,
      });
    }

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async findOne(id: string) {
    const auth = await this.authorizationsRepository.findOne({
      where: { id },
      relations: ['patient'],
    });
    if (!auth) throw new NotFoundException('Autorización no encontrada');
    return auth;
  }

  async create(dto: CreateAuthorizationDto) {
    const auth = this.authorizationsRepository.create(dto);
    return this.authorizationsRepository.save(auth);
  }

  async update(id: string, dto: UpdateAuthorizationDto) {
    const auth = await this.findOne(id);
    Object.assign(auth, dto);
    return this.authorizationsRepository.save(auth);
  }
}
