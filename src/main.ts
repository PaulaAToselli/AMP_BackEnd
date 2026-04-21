import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import {
  AllExceptionsFilter,
  HttpExceptionFilter,
} from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('AMPARAR API')
    .setDescription(
      'Backend del Registro Único de Casos — AMPARAR SRL.\n\n' +
      'Autenticación: usar `POST /auth/login` para obtener el `accessToken` y pegarlo en el botón **Authorize** (Bearer token).',
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .addTag('auth', 'Login, refresh y logout')
    .addTag('users', 'Gestión de usuarios del sistema (solo ADMIN)')
    .addTag('patients', 'Pacientes')
    .addTag('authorizations', 'Autorizaciones de Obra Social')
    .addTag('providers', 'Prestadores')
    .addTag('services', 'Servicios / Turnos')
    .addTag('sync', 'Sincronización con Intersoftic (solo ADMIN)')
    .addTag('dashboard', 'KPIs y métricas')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
