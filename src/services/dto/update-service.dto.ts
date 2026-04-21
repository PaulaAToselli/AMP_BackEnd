import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateServiceDto } from './create-service.dto';
import { ServiceStatus } from '../enums/service-status.enum';
import { TerminationReason } from '../enums/termination-reason.enum';

export class UpdateServiceDto extends PartialType(CreateServiceDto) {
  @IsOptional()
  @IsEnum(ServiceStatus)
  status?: ServiceStatus;

  @IsOptional()
  @IsEnum(TerminationReason)
  terminationReason?: TerminationReason;

  @IsOptional()
  @IsBoolean()
  billable?: boolean;

  @IsOptional()
  @IsString()
  coordinatorAction?: string;
}
