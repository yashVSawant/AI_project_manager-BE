import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class ProjectDto {
    @IsNotEmpty()
    @IsString()
    name :string

    @IsOptional()
    @IsString()
    description:string
}