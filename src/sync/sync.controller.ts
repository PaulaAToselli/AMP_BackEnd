import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { SyncService } from './sync.service';
import { SyncEntity } from './entities/sync-log.entity';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('sync')
@ApiBearerAuth('access-token')
@Controller('sync')
@Roles(UserRole.ADMIN)
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('trigger/:entity')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Disparar sincronización manual con Intersoftic' })
  @ApiParam({ name: 'entity', enum: SyncEntity })
  trigger(@Param('entity') entity: SyncEntity) {
    return this.syncService.triggerSync(entity, 'MANUAL');
  }

  @Get('logs')
  @ApiOperation({ summary: 'Historial de sincronizaciones' })
  getLogs(@Query() pagination: PaginationDto) {
    return this.syncService.getLogs(pagination.page, pagination.limit);
  }
}
