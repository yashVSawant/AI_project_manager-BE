import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";
import { ConditionAction } from "../../../../generated/prisma/enums";

export class conditionDto {
    @IsOptional()
    @IsUUID()
    id?:string 
    
    @IsString()
    @IsNotEmpty()
    rule:string
}

export class ComponentConditionDto {

    @IsOptional()
        @IsUUID()
        id?:string

    @IsString()
    @IsNotEmpty()
    action:ConditionAction

    @IsString()
    @IsNotEmpty()
    conditionId:string

    @IsString()
    @IsNotEmpty()
    componentId:string
}