import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

interface TicketConfirmationEmail {
  recipientName: string;
  recipientEmail: string;
  trackingNumber: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  private readonly transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  async sendTicketConfirmation(
    data: TicketConfirmationEmail,
  ): Promise<boolean> {
    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASS
    ) {
      this.logger.warn('SMTP is not configured.');
      return false;
    }

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
        to: data.recipientEmail,
        subject: `Support Ticket Submitted (${data.trackingNumber})`,
        text: `
Hello ${data.recipientName},

Your support ticket has been submitted successfully.

Tracking Number:
${data.trackingNumber}

Please keep this tracking number to track your ticket.

Thank you.
        `,
        html: `
<div style="font-family:Arial,sans-serif;line-height:1.6">
<h2>Support Ticket Submitted</h2>

<p>Hello ${data.recipientName},</p>

<p>Your support ticket has been submitted successfully.</p>

<p><strong>Tracking Number</strong></p>

<div style="padding:16px;background:#f3f4f6;border-radius:8px;font-size:22px;font-weight:bold">
${data.trackingNumber}
</div>

<p style="margin-top:20px">
Please save this tracking number. You can use it anytime to track your ticket.
</p>

<p>Thank you.</p>
</div>
        `,
      });

      return true;
    } catch (error) {
      this.logger.error(
        'Failed to send confirmation email',
        error instanceof Error ? error.stack : undefined,
      );

      return false;
    }
  }
}