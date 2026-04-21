import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Provider } from './entities/provider.entity';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { FilterProviderDto } from './dto/filter-provider.dto';

@Injectable()
export class ProvidersService {
  constructor(
    @InjectRepository(Provider)
    private readonly providersRepository: Repository<Provider>,
  ) {}

  async findAll(filters: FilterProviderDto) {
    const { page, limit, specialty, coverageZone, isActive, search } = filters;
    const qb = this.providersRepository
      .createQueryBuilder('p')
      .orderBy('p.fullName', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    if (specialty) qb.andWhere('p.specialty = :specialty', { specialty });
    if (coverageZone) qb.andWhere('p.coverageZone ILIKE :zone', { zone: `%${coverageZone}%` });
    if (isActive !== undefined) qb.andWhere('p.isActive = :isActive', { isActive });
    if (search) qb.andWhere('p.fullName ILIKE :search', { search: `%${search}%` });

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async findOne(id: string) {
    const provider = await this.providersRepository.findOne({ where: { id } });
    if (!provider) throw new NotFoundException('Prestador no encontrado');
    return provider;
  }

  async create(dto: CreateProviderDto) {
    const provider = this.providersRepository.create(dto);
    return this.providersRepository.save(provider);
  }

  async update(id: string, dto: UpdateProviderDto) {
    const provider = await this.findOne(id);
    Object.assign(provider, dto);
    return this.providersRepository.save(provider);
  }
}
