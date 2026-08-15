import { IsOptional, IsString, IsArray } from 'class-validator';

export class QueryDocumentsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

export class ReprocessDocumentDto {
  @IsOptional()
  @IsArray()
  documentIds?: string[];
}
