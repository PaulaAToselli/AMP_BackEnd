import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión y obtener tokens JWT' })
  @ApiResponse({ status: 200, description: 'Retorna accessToken y refreshToken' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar access token usando refresh token' })
  @ApiResponse({ status: 200, description: 'Nuevo par de tokens' })
  @ApiResponse({ status: 401, description: 'Refresh token inválido o expirado' })
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Cerrar sesión e invalidar refresh token' })
  @ApiResponse({ status: 204, description: 'Sesión cerrada' })
  logout(@Request() req: { user: { id: string } }) {
    return this.authService.logout(req.user.id);
  }
}
