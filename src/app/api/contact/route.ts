import { NextResponse } from 'next/server';
import * as postmark from 'postmark';

if (!process.env.POSTMARK_API_TOKEN) {
  throw new Error('POSTMARK_API_TOKEN is not defined in environment variables');
}

const client = new postmark.Client(process.env.POSTMARK_API_TOKEN);

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json();

    // Send email using Postmark
    await client.sendEmail({
      From: 'nick@nickdobosmedia.com',
      To: 'nick@nickdobosmedia.com',
      Subject: `Contact Form: ${subject}`,
      HtmlBody: `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
      TextBody: `
        New Contact Form Submission
        From: ${name} (${email})
        Subject: ${subject}
        Message: ${message}
      `,
      MessageStream: 'outbound'
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
} 