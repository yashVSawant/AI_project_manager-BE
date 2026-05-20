import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class ProjectDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;
}

export class EditCompontent {
  @IsNotEmpty()
  @IsString()
  promt:string

  @IsNotEmpty()
  @IsString()
  componentId:string

  @IsObject()
  @IsNotEmpty()
  componentTree:any
}
