import { IsNotEmpty, IsString } from 'class-validator';

export class GenerateProjectDto {
  @IsString()
  @IsNotEmpty()
  promt: string;
}
