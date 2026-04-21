import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { CheckinDto } from './dto/checkin.dto';
import { FilterServiceDto } from './dto/filter-service.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';

@ApiTags('services')
@ApiBearerAuth('access-token')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar servicios (filtros: patientId, providerId, status, dateFrom, dateTo)' })
  findAll(@Query() filters: FilterServiceDto) {
    return this.servicesService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener servicio por ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.servicesService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.COORDINACION)
  @ApiOperation({ summary: 'Crear servicio manualmente (Coordinación/Admin)' })
  create(@Body() dto: CreateServiceDto) {
    return this.servicesService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.COORDINACION)
  @ApiOperation({ summary: 'Actualizar servicio (status, terminationReason, etc.)' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateServiceDto) {
    return this.servicesService.update(id, dto);
  }

  @Patch(':id/checkin')
  @Roles(UserRole.ADMIN, UserRole.COORDINACION)
  @ApiOperation({ summary: 'Marcación manual por coordinador — pone status CUMPLIDO y billable true' })
  checkin(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CheckinDto) {
    return this.servicesService.checkin(id, dto);
  }
}
