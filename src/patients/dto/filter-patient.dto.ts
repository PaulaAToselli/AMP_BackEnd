import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Complexity } from '../enums/complexity.enum';

export class FilterPatientDto extends PaginationDto {
  @IsOptional()
  @IsString()
  obraSocial?: string;

  @IsOptional()
  @IsEnum(Complexity)
  complexity?: Complexity;

  @IsOptional()
  @IsString()
  locality?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
