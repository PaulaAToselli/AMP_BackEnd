import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { PrestationType } from '../enums/prestion-type.enum';
import { IntakeChannel } from '../../common/enums/intake-channel.enum';
import { RequestOrigin } from '../enums/request-origin.enum';

export class CreateServiceDto {
  @IsOptional()
  @IsString()
  intersofticId?: string;

  @IsOptional()
  @IsString()
  prestationNumber?: string;

  @IsUUID()
  patientId: string;

  @IsUUID()
  providerId: string;

  @IsOptional()
  @IsUUID()
  authorizationId?: string;

  @IsDateString()
  serviceDate: string;

  @IsOptional()
  @IsEnum(PrestationType)
  prestationType?: PrestationType;

  @IsOptional()
  @IsString()
  assignedSpecialty?: string;

  @IsOptional()
  @IsString()
  shift?: string;

  @IsOptional()
  @IsEnum(IntakeChannel)
  intakeChannel?: IntakeChannel;

  @IsOptional()
  @IsEnum(RequestOrigin)
  requestOrigin?: RequestOrigin;

  @IsOptional()
  @IsString()
  nonComplianceReason?: string;
}
