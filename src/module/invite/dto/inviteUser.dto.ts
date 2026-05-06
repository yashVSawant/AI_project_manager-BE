import { IsEmail, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { ProjectRole } from "../../../../generated/prisma/enums";

export class InviteUserDto {

    @IsNotEmpty()
    @IsEmail()
    email:string;

    @IsNotEmpty()
    @IsString()
    projectId:string;

    @IsNotEmpty()
    @IsEnum(ProjectRole)
    role:ProjectRole;
}