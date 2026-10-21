import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { Correo } from './plantillas';

export type ResultadoEnvio = 'enviado' | 'sin_destinatario' | 'smtp_no_configurado' | 'error';

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Envío por SMTP (nodemailer): sirve con cualquier proveedor gratuito (Gmail, Brevo, etc.). */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  constructor() {
    const host = process.env.SMTP_HOST;
    if (!host) {
      this.logger.warn('SMTP_HOST vacío: las notificaciones se loguean pero NO se envían mails');
      return;
    }
    this.transporter = nodemailer.createTransport({
      host,
      port: +(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === 'true', // true = puerto 465; false = STARTTLS en 587
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
  }

  async enviar(destinatario: string | null | undefined, correo: Correo): Promise<ResultadoEnvio> {
    const para = destinatario?.trim();
    if (!para || !EMAIL_VALIDO.test(para)) return 'sin_destinatario';
    if (!this.transporter) {
      this.logger.log(`[sin SMTP] ${correo.asunto}`);
      return 'smtp_no_configurado';
    }
    try {
      await this.transporter.sendMail({
        from: process.env.MAIL_FROM || process.env.SMTP_USER,
        to: para,
        subject: correo.asunto,
        text: correo.texto,
        html: correo.html,
      });
      return 'enviado';
    } catch (error) {
      // Solo el motivo: ni el destinatario ni el contenido van al log.
      this.logger.error(`No se pudo enviar "${correo.asunto}": ${(error as Error).message}`);
      return 'error';
    }
  }
}
