import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.saveRefreshTokenHash(user.id, tokens.refreshToken);
    return tokens;
  }

  async refresh(refreshToken: string) {
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.isActive || !user.refreshTokenHash) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const tokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshTokenHash,
    );
    if (!tokenMatches) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.saveRefreshTokenHash(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.updateRefreshTokenHash(userId, null);
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload: JwtPayload = { sub: userId, email, role };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sign = (p: JwtPayload, secret: string, expiresIn: string) =>
      this.jwtService.signAsync(p as any, { secret, expiresIn: expiresIn as any });

    const [accessToken, refreshToken] = await Promise.all([
      sign(
        payload,
        this.configService.getOrThrow('JWT_SECRET'),
        this.configService.getOrThrow('JWT_EXPIRES_IN'),
      ),
      sign(
        payload,
        this.configService.getOrThrow('JWT_REFRESH_SECRET'),
        this.configService.getOrThrow('JWT_REFRESH_EXPIRES_IN'),
      ),
    ]);

    return { accessToken, refreshToken };
  }

  private async saveRefreshTokenHash(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateRefreshTokenHash(userId, hash);
  }
}
