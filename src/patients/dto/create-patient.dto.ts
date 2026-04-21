import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { Complexity } from '../enums/complexity.enum';
import { IntakeChannel } from '../../common/enums/intake-channel.enum';

export class CreatePatientDto {
  @IsOptional()
  @IsString()
  intersofticId?: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  dni: string;

  @IsString()
  affiliateNumber: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  locality?: string;

  @IsOptional()
  @IsString()
  geoLocation?: string;

  @IsOptional()
  @IsString()
  obraSocial?: string;

  @IsOptional()
  @IsString()
  cieDiagnosis?: string;

  @IsOptional()
  @IsEnum(Complexity)
  complexity?: Complexity;

  @IsOptional()
  @IsString()
  familyContact?: string;

  @IsOptional()
  @IsString()
  treatingDoctor?: string;

  @IsOptional()
  @IsEnum(IntakeChannel)
  intakeChannel?: IntakeChannel;

  @IsOptional()
  @IsString()
  observations?: string;
}
