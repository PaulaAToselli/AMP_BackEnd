import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Authorization } from './entities/authorization.entity';
import { AuthorizationsService } from './authorizations.service';
import { AuthorizationsController } from './authorizations.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Authorization])],
  providers: [AuthorizationsService],
  controllers: [AuthorizationsController],
  exports: [AuthorizationsService],
})
export class AuthorizationsModule {}
