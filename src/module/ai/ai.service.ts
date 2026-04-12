// ai.service.ts

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import OpenAI from "openai";
type Role = "user"|"system"


@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(private configService: ConfigService ) {
    
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

async callAiApi(messages:{role:Role,content:string}[],response_format?:any){
  return  await this.openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    response_format
  });
}


async generateProject(input: string, userId: string) {
  const messages:{role:Role,content:string}[] = [
      {
        role: "system",
        content: `
        You are a senior frontend + backend architect.

        Follow these STRICT rules:
        1. "components.tag" MUST be valid HTML tag
        2. "components.className" MUST be valid CSS classes 
          - Use ONLY Tailwind classes (e.g., "flex", "p-4", "m-2", "bg-white", "text-sm", "rounded-lg").
          - Do NOT invent custom class names.
          - Do NOT use plain CSS names like "container", "box", "header-style".
          - Combine multiple Tailwind classes separated by space.
          - Keep it realistic and minimal (avoid unnecessary classes).
        3. "components.description" must describe UI
        4. DO NOT include "rules" inside components
        5. "components.id" must be unique
        6. "components.parentId" must form tree
        7. Single root (parentId: null)
        8. No isolated components

        9. Logic ONLY inside "conditions"
        10. Each condition has id + rule
        11. Use "componentConditions" for mapping
        12. Actions: HIDDEN, DISABLED
        13. One condition → multiple components allowed

        Return ONLY JSON.
        `
      },
      {
        role: "user",
        content: `Convert this idea into structured JSON: "${input}"`,
      },
    ];
   const response_format = {
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
                  tag: {
                    type: "string",
                    enum: ["div","button","input","form","section","table","header","footer","label","h1","h2","h3","h4","h5","h6"]
                  },
                  description: { type: "string" },
                  className: { type: "string" },
                  parentId: { type: ["string","null"] }
                },
                required: ["id","tag","className","parentId"]
              }
            },

            conditions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  rule: { type: "string" }
                },
                required: ["id","rule"]
              }
            },

            componentConditions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  conditionId: { type: "string" },
                  componentId: { type: "string" },
                  action: {
                    type: "string",
                    enum: ["HIDDEN","DISABLED"]
                  }
                },
                required: ["conditionId","componentId","action"]
              }
            }
          },
          required: ["projectName","description","components"]
        }
      }
    }
  const response = await this.callAiApi(messages,response_format)
  // const response = await this.openai.chat.completions.create({
  //   model: "gpt-4o-mini",
  //   messages: [
  //     {
  //       role: "system",
  //       content: `
  //       You are a senior frontend + backend architect.

  //       Follow these STRICT rules:
  //       1. "components.tag" MUST be valid HTML tag
  //       2. "components.className" MUST be valid CSS classes
  //       3. "components.description" must describe UI
  //       4. DO NOT include "rules" inside components
  //       5. "components.id" must be unique
  //       6. "components.parentId" must form tree
  //       7. Single root (parentId: null)
  //       8. No isolated components

  //       9. Logic ONLY inside "conditions"
  //       10. Each condition has id + rule
  //       11. Use "componentConditions" for mapping
  //       12. Actions: HIDDEN, DISABLED
  //       13. One condition → multiple components allowed

  //       Return ONLY JSON.
  //       `
  //     },
  //     {
  //       role: "user",
  //       content: `Convert this idea into structured JSON: "${input}"`,
  //     },
  //   ],
  //   response_format: {
  //     type: "json_schema",
  //     json_schema: {
  //       name: "project_schema",
  //       schema: {
  //         type: "object",
  //         properties: {
  //           projectName: { type: "string" },
  //           description: { type: "string" },

  //           components: {
  //             type: "array",
  //             items: {
  //               type: "object",
  //               properties: {
  //                 id: { type: "string" },
  //                 tag: {
  //                   type: "string",
  //                   enum: ["div","button","input","form","section","table","header","footer","label","h1","h2","h3","h4","h5","h6"]
  //                 },
  //                 description: { type: "string" },
  //                 className: { type: "string" },
  //                 parentId: { type: ["string","null"] }
  //               },
  //               required: ["id","tag","className","parentId"]
  //             }
  //           },

  //           conditions: {
  //             type: "array",
  //             items: {
  //               type: "object",
  //               properties: {
  //                 id: { type: "string" },
  //                 rule: { type: "string" }
  //               },
  //               required: ["id","rule"]
  //             }
  //           },

  //           componentConditions: {
  //             type: "array",
  //             items: {
  //               type: "object",
  //               properties: {
  //                 conditionId: { type: "string" },
  //                 componentId: { type: "string" },
  //                 action: {
  //                   type: "string",
  //                   enum: ["HIDDEN","DISABLED"]
  //                 }
  //               },
  //               required: ["conditionId","componentId","action"]
  //             }
  //           }
  //         },
  //         required: ["projectName","description","components"]
  //       }
  //     }
  //   }
  // });

  const raw = response.choices[0].message.content;
  if(!raw){
    console.log("no response from ai");
    throw new Error("Something went wrong!")
  }
  return  JSON.parse(raw);
}

}

