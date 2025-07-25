import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import formData from 'form-data';
import Mailgun from 'mailgun.js';
import { readFile } from 'fs/promises';
import { join } from 'path';
import {
  compile,
  TemplateDelegate as HandlebarsTemplateDelegate,
} from 'handlebars';
import * as Handlebars from 'handlebars';

export interface MailgunSendOptions {
  to: string;
  subject: string;
  template?: string;
  context?: Record<string, string | number | boolean | object>;
  html?: string;
  text?: string;
}

export interface MailgunResponse {
  id: string;
  message: string;
}

@Injectable()
export class MailgunService implements OnModuleInit {
  private readonly logger = new Logger(MailgunService.name);
  private readonly mailgun: any;
  private readonly domain: string;
  private readonly from: string;
  private readonly templatesCache = new Map<
    string,
    HandlebarsTemplateDelegate
  >();

  onModuleInit() {
    Handlebars.registerHelper('eq', (a: unknown, b: unknown) => a === b);
  }

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.getOrThrow<string>('MAILGUN_API_KEY');
    this.domain = this.configService.getOrThrow<string>('MAILGUN_DOMAIN');
    this.from = `"CSGUILD" <${this.configService.get('MAIL_FROM', `noreply@${this.domain}`)}>`;

    const mg = new Mailgun(formData);
    this.mailgun = mg.client({
      username: 'api',
      key: apiKey,
    });

    this.logger.log(`Mailgun service initialized for domain: ${this.domain}`);
  }

  async sendMail(options: MailgunSendOptions): Promise<MailgunResponse> {
    try {
      let html: string | undefined;
      let text: string | undefined;

      if (options.template && options.context) {
        const { html: compiledHtml, text: compiledText } =
          await this.renderTemplate(options.template, options.context);
        html = compiledHtml;
        text = compiledText;
      } else {
        html = options.html;
        text = options.text;
      }

      const messageData = {
        from: this.from,
        to: options.to,
        subject: options.subject,
        html,
        text,
      };

      this.logger.debug(
        `Sending email to ${options.to} with subject: ${options.subject}`,
      );

      const response = await this.mailgun.messages.create(
        this.domain,
        messageData,
      );

      this.logger.log(
        `Email sent successfully to ${options.to}, ID: ${response.id}`,
      );

      return response;
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}:`, error);
      throw error;
    }
  }

  private async renderTemplate(
    templateName: string,
    context: Record<string, string | number | boolean | object>,
  ): Promise<{ html: string; text: string }> {
    try {
      // Get or compile the template
      let template = this.templatesCache.get(templateName);

      if (!template) {
        const templatePath = join(
          __dirname,
          'templates',
          `${templateName}.hbs`,
        );
        const templateContent = await readFile(templatePath, 'utf-8');

        template = compile(templateContent);
        this.templatesCache.set(templateName, template);
      }

      const html = template(context);

      // Generate plain text version by stripping HTML tags
      const text = html
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      return { html, text };
    } catch (error) {
      this.logger.error(`Failed to render template ${templateName}:`, error);
      throw error;
    }
  }
}
