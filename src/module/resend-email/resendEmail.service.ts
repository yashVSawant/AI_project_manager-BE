import { Injectable } from "@nestjs/common";
import { Resend } from "resend";

@Injectable()
export class ResendEmailService {
  private resend: Resend;
private from : string;
  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
    const from = process.env.COMPANY_EMAIL
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is missing");
    }
    if(!from){
        throw new Error("from is not present in env.")
    }

    this.from = from
  }

  async sendEmail({to , subject , html}:{to:string[] , subject:string , html:string}) {
    const { data, error } = await this.resend.emails.send({
      from: this.from, // use verified domain later
      to: to,
      subject: subject,
      html: html,
    });

    if (error) {
      console.error("Email error:", error);
      throw new Error("Failed to send email");
    }

    return data;
  }
}