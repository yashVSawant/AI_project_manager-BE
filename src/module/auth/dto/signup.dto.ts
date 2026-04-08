import { IsNotEmpty, IsString } from "class-validator";
import { loginDto } from "./login.dto";

export class signupDto extends loginDto {
    @IsString()
    @IsNotEmpty()
    name :string
}