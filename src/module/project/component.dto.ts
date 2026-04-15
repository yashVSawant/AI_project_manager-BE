import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";

export class ComponentDto {

    @IsOptional()
    @IsUUID()
    id?:string

  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsString()
  rules?: string;

  @IsString()
  className: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsOptional()
  @IsUUID()
  onActiveComponentId?: string;

  @IsOptional()
  @IsString()
  activeClassName?: string;

  @IsNumber()
  @IsNotEmpty()
  order:number
}