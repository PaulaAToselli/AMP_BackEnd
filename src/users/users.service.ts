import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findAll(pagination: PaginationDto) {
    const { page, limit } = pagination;
    const [items, total] = await this.usersRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'createdAt', 'updatedAt'],
    });
    return { items, total, page, limit };
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'createdAt', 'updatedAt'],
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async create(dto: CreateUserDto) {
    const existing = await this.usersRepository.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('El email ya está en uso');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepository.create({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: dto.role,
    });
    const saved = await this.usersRepository.save(user);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, refreshTokenHash: __, ...result } = saved;
    return result;
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.findByIdOrFail(id);

    if (dto.email && dto.email !== user.email) {
      const existing = await this.usersRepository.findOne({ where: { email: dto.email } });
      if (existing) throw new ConflictException('El email ya está en uso');
      user.email = dto.email;
    }
    if (dto.password) user.passwordHash = await bcrypt.hash(dto.password, 10);
    if (dto.firstName !== undefined) user.firstName = dto.firstName;
    if (dto.lastName !== undefined) user.lastName = dto.lastName;
    if (dto.role !== undefined) user.role = dto.role;
    if (dto.isActive !== undefined) user.isActive = dto.isActive;

    const saved = await this.usersRepository.save(user);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, refreshTokenHash: __, ...result } = saved;
    return result;
  }

  async remove(id: string) {
    const user = await this.findByIdOrFail(id);
    await this.usersRepository.remove(user);
  }

  // --- internal ---

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async updateRefreshTokenHash(userId: string, hash: string | null): Promise<void> {
    await this.usersRepository.update(userId, { refreshTokenHash: hash });
  }

  async findByIdOrFail(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }
}
