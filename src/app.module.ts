import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { envValidationSchema } from './config/env.validation';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PatientsModule } from './patients/patients.module';
import { AuthorizationsModule } from './authorizations/authorizations.module';
import { ProvidersModule } from './providers/providers.module';
import { ServicesModule } from './services/services.module';
import { SyncModule } from './sync/sync.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const databaseUrl = config.get<string>('DATABASE_URL');
        const isProd = config.get<string>('NODE_ENV') === 'production';

        if (databaseUrl) {
          return {
            type: 'postgres',
            url: databaseUrl,
            ssl: isProd ? { rejectUnauthorized: false } : false,
            autoLoadEntities: true,
            synchronize: !isProd,
            logging: !isProd,
          };
        }

        return {
          type: 'postgres',
          host: config.get<string>('DB_HOST'),
          port: config.get<number>('DB_PORT'),
          database: config.get<string>('DB_NAME'),
          username: config.get<string>('DB_USER'),
          password: config.get<string>('DB_PASS'),
          autoLoadEntities: true,
          synchronize: !isProd,
          logging: !isProd,
        };
      },
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    PatientsModule,
    AuthorizationsModule,
    ProvidersModule,
    ServicesModule,
    SyncModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
