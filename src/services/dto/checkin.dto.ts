import { IsOptional, IsString } from 'class-validator';

export class CheckinDto {
  @IsOptional()
  @IsString()
  coordinatorAction?: string;

  @IsOptional()
  @IsString()
  geoLocation?: string;
}
