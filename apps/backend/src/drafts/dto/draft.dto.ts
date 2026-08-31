import { IsString, IsArray, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateDraftDto {
  @ApiProperty({ type: [String], description: 'List of document IDs to use as reference' })
  @IsArray()
  @IsString({ each: true })
  documentIds!: string[];

  @ApiProperty({ description: 'User prompt instructions for drafting' })
  @IsString()
  @IsNotEmpty()
  prompt!: string;

  @ApiProperty({ description: 'Draft template (e.g. Executive Memo, Project Proposal, etc.)' })
  @IsString()
  @IsNotEmpty()
  template!: string;

  @ApiProperty({ type: [String], required: false, description: 'Optional list of specific section IDs to scope details' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sectionIds?: string[];
}

export class RefineDraftDto {
  @ApiProperty({ description: 'The original generated markdown draft content' })
  @IsString()
  @IsNotEmpty()
  originalDraft!: string;

  @ApiProperty({ description: 'Specific modification instructions' })
  @IsString()
  @IsNotEmpty()
  refineInstruction!: string;

  @ApiProperty({ type: [String], required: false, description: 'Optional list of document IDs to include as reference' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documentIds?: string[];
}
