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
import { AuthorizationsService } from './authorizations.service';
import { CreateAuthorizationDto } from './dto/create-authorization.dto';
import { UpdateAuthorizationDto } from './dto/update-authorization.dto';
import { FilterAuthorizationDto } from './dto/filter-authorization.dto';

@ApiTags('authorizations')
@ApiBearerAuth('access-token')
@Controller('authorizations')
export class AuthorizationsController {
  constructor(private readonly authorizationsService: AuthorizationsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar autorizaciones (filtros: patientId, obraSocial, expired, expiringSoon)' })
  findAll(@Query() filters: FilterAuthorizationDto) {
    return this.authorizationsService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener autorización por ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.authorizationsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear autorización' })
  create(@Body() dto: CreateAuthorizationDto) {
    return this.authorizationsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar autorización' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAuthorizationDto,
  ) {
    return this.authorizationsService.update(id, dto);
  }
}
