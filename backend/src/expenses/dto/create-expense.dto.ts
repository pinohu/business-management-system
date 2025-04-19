import { IsString, IsOptional, IsDate, IsNumber, IsUUID } from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  description: string;

  @IsNumber()
  amount: number;

  @IsString()
  category: string;

  @IsDate()
  date: Date;

  @IsUUID()
  @IsOptional()
  projectId?: string;

  @IsString()
  @IsOptional()
  receiptUrl?: string;
}
