import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@ApiBearerAuth('access-token')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('kpis')
  @ApiOperation({
    summary: 'KPIs del sistema',
    description:
      'Retorna: pacientes activos, pacientes críticos (JUDICIAL/24HS), servicios pendientes, completados este mes, incumplimientos y tasa de marcación en app.',
  })
  getKpis() {
    return this.dashboardService.getKpis();
  }
}
