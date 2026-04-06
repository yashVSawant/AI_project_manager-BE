import { IsString } from "class-validator";

export class GenerateProjectDto {
  @IsString()
  message: string;
}