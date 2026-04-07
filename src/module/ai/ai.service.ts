// ai.service.ts

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import OpenAI from "openai";


@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    
    // this.openai = new OpenAI({
    //   apiKey: this.configService.get<string>("OPENAI_API_KEY"),
    // });

     this.openai =  new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: this.configService.get<string>("OPENAI_API_KEY"),
  // defaultHeaders: {
  //   'HTTP-Referer': '<YOUR_SITE_URL>', // Optional. Site URL for rankings on openrouter.ai.
  //   'X-OpenRouter-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.
  // },
})
    
  }

  async generateProject(input: string) {
  const response = await this.openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
You are a senior frontend + backend architect.

Follow these STRICT rules:

1. "components.tag" MUST be a valid HTML tag (e.g., div, button, input, form, table, section).
2. "components.className" MUST be valid CSS class names (e.g., "flex justify-center p-4").
3. "components.description" must describe UI purpose.
4. "components.rules" must describe behavior/logic (e.g., validation, events, conditions).
5. "components.id" must be a unique identifier for each component.
6. "components.parentId" must be the ID of parent component or null for root components.
7. always start with a root component (parentId: null) and build a hierarchical structure. 
8. all components must be connected in a single tree structure with one root. No isolated components allowed.


Return only valid JSON.
Do not include explanations.
`
      },
      {
        role: "user",
        content: `Convert this idea into structured JSON: "${input}"`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "project_schema",
        schema: {
          type: "object",
          properties: {
            projectName: { type: "string" },
            description: { type: "string" },
            components: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  tag: { type: "string" ,enum: ["div", "button", "input", "form", "section", "table", "header", "footer","label","h1","h2","h3","h4","h5","h6"]},
                  description: { type: "string" },
                  rules: { type: "string" },
                  className: { type: "string" },
                  parentId:{ type: "string",nullable: true }
                },
                required: ["tag", "className"]
              }
            },
            
          },
          required: ["projectName", "description", "components"]
        }
      }
    }
  });

  return response.choices[0].message.content;
}
}