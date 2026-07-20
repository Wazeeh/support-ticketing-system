import { IsString, MinLength, IsOptional, IsBoolean } from 'class-validator';

export class CreateReplyDto {
  @IsString()
  @MinLength(1)
  message: string;

  @IsOptional()
  @IsBoolean()
  is_closing_reply?: boolean;
}