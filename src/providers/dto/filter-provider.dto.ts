import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Specialty } from '../enums/specialty.enum';

export class FilterProviderDto extends PaginationDto {
  @IsOptional()
  @IsEnum(Specialty)
  specialty?: Specialty;

  @IsOptional()
  @IsString()
  coverageZone?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  search?: string;
}
