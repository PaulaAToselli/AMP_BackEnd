import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class FilterAuthorizationDto extends PaginationDto {
  @IsOptional()
  @IsUUID()
  patientId?: string;

  @IsOptional()
  @IsString()
  obraSocial?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  expired?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  expiringSoon?: boolean;
}
