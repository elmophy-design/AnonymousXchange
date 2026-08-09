import nodemailer from 'nodemailer'
import { logger } from '../utils/logger'

const smtpHost = process.env.SMTP_HOST
const smtpUser = process.env.SMTP_USER
const smtpPass = process.env.SMTP_PASS
const smtpFrom = process.env.SMTP_FROM || 'noreply@anonymousxchange.com'

let transporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (!smtpHost || !smtpUser || !smtpPass) return null
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: smtpUser, pass: smtpPass },
    })
  }
  return transporter
}

export const notificationService = {
  async sendEmail(to: string, subject: string, html: string) {
    const t = getTransporter()
    if (!t) {
      logger.info(`[email:skipped] to=${to} subject=${subject}`)
      return { skipped: true }
    }
    await t.sendMail({ from: smtpFrom, to, subject, html })
    logger.info(`[email:sent] to=${to} subject=${subject}`)
    return { sent: true }
  },

  async notifyTransactionStatus(params: {
    email?: string | null
    reference: string
    status: string
    asset: string
  }) {
    if (!params.email) return
    const subject = `Transaction ${params.reference} is now ${params.status}`
    const html = `
      <h2>AnonymousXchange</h2>
      <p>Your transaction <strong>${params.reference}</strong> (${params.asset}) status is now <strong>${params.status}</strong>.</p>
      <p>Open your dashboard for details.</p>
    `
    return this.sendEmail(params.email, subject, html)
  },

  /** SMS placeholder – wire Twilio / Termii later */
  async sendSms(phone: string, message: string) {
    logger.info(`[sms:skipped] to=${phone} msg=${message.slice(0, 40)}...`)
    return { skipped: true }
  },

  async sendSupportTicket(payload: {
    subject: string
    message: string
    email: string
    userId?: string
    createdAt: string
  }) {
    const ops = process.env.SUPPORT_EMAIL || process.env.SMTP_FROM
    if (!ops) {
      logger.info('[support:ticket:logged]', payload)
      return { logged: true }
    }
    const html = `
      <h2>Support ticket</h2>
      <p><strong>From:</strong> ${payload.email}</p>
      <p><strong>User ID:</strong> ${payload.userId || '—'}</p>
      <p><strong>Subject:</strong> ${payload.subject}</p>
      <p><strong>Message:</strong></p>
      <pre>${payload.message}</pre>
      <p><small>${payload.createdAt}</small></p>
    `
    return this.sendEmail(ops, `[Support] ${payload.subject}`, html)
  },

}
