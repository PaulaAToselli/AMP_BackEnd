import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Specialty } from '../enums/specialty.enum';

export class CreateProviderDto {
  @IsOptional()
  @IsString()
  intersofticId?: string;

  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsEnum(Specialty)
  specialty: Specialty;

  @IsOptional()
  @IsString()
  coverageZone?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  distanceToPatient?: number;

  @IsOptional()
  @IsString()
  availability?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  agreedFee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  osValue?: number;
}
