import { Body, Controller, Post } from "@nestjs/common";
import { AiService } from "./ai.service";
import { GenerateProjectDto } from "./dto/generateProject.dto";

@Controller("ai")
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post("generate")
  async generate(@Body() dto: GenerateProjectDto) {
    return this.aiService.generateProject(dto.message);
  }
}