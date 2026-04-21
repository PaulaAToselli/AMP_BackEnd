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
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { FilterPatientDto } from './dto/filter-patient.dto';

@ApiTags('patients')
@ApiBearerAuth('access-token')
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar pacientes con filtros opcionales (obraSocial, complexity, locality, search)' })
  findAll(@Query() filters: FilterPatientDto) {
    return this.patientsService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener paciente por ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.patientsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear paciente manualmente (Admisión)' })
  create(@Body() dto: CreatePatientDto) {
    return this.patientsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar datos del paciente' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePatientDto) {
    return this.patientsService.update(id, dto);
  }
}
