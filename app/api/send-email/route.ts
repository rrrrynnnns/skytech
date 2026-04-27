import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { to, subject, outstandingBalance, message } = await request.json();

    if (!to || !subject || !message || outstandingBalance === undefined) {
      return NextResponse.json(
        { error: 'Recipient, subject, outstanding balance, and message are required' },
        { status: 400 },
      );
    }

    const smtpHost = (process.env.SMTP_HOST || '').trim();
    const smtpPort = Number(process.env.SMTP_PORT || '587');
    const smtpUser = (process.env.SMTP_USER || '').trim();
    const smtpPass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');
    const smtpFrom = (process.env.SMTP_FROM || smtpUser || '').trim();

    if (!smtpHost || !smtpUser || !smtpPass || !smtpFrom) {
      const missing = [
        !smtpHost ? 'SMTP_HOST' : null,
        !smtpUser ? 'SMTP_USER' : null,
        !smtpPass ? 'SMTP_PASS' : null,
        !smtpFrom ? 'SMTP_FROM' : null,
      ].filter(Boolean);

      return NextResponse.json(
        {
          error:
            'Email service not configured. Add SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM in .env',
          missing,
        },
        { status: 500 },
      );
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const balanceText = Number(outstandingBalance).toFixed(2);
    const textBody = `Outstanding Balance:\nP${balanceText}\n\nMessage Preview:\n${message}`;

    await transporter.sendMail({
      from: smtpFrom,
      to,
      subject,
      text: textBody,
    });

    return NextResponse.json({
      success: true,
      message: 'Reminder email sent successfully',
    });
  } catch (error) {
    console.error('Error sending email reminder:', error);
    return NextResponse.json({ error: 'Failed to send email reminder' }, { status: 500 });
  }
}
