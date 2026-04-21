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
import { ProvidersService } from './providers.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { FilterProviderDto } from './dto/filter-provider.dto';

@ApiTags('providers')
@ApiBearerAuth('access-token')
@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar prestadores (filtros: specialty, coverageZone, isActive, search)' })
  findAll(@Query() filters: FilterProviderDto) {
    return this.providersService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener prestador por ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.providersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear prestador manualmente' })
  create(@Body() dto: CreateProviderDto) {
    return this.providersService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar prestador' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProviderDto) {
    return this.providersService.update(id, dto);
  }
}
