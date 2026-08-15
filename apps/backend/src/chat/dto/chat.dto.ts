import { IsNotEmpty, IsOptional, IsString, IsArray } from 'class-validator';

export class CreateConversationDto {
  @IsOptional()
  @IsString()
  title?: string;
}

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsOptional()
  @IsArray()
  documentIds?: string[];
}
