import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateAuthorizationDto {
  @IsOptional()
  @IsString()
  intersofticId?: string;

  @IsUUID()
  patientId: string;

  @IsString()
  authorizationNumber: string;

  @IsOptional()
  @IsString()
  obraSocial?: string;

  @IsOptional()
  @IsString()
  osDelegacion?: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  expirationDate: string;

  @IsOptional()
  @IsBoolean()
  autoCancel?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  monthlyLimit?: number;

  @IsOptional()
  @IsString()
  paymentCondition?: string;

  @IsOptional()
  @IsString()
  observations?: string;
}
