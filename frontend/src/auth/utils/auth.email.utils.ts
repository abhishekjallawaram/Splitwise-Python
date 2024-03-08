import * as nodemailer from 'nodemailer';

export async function sendEmail(
  email_to: string,
  email_subject: string,
  email_content: string,
) {
  const { EMAIL_ID, EMAIL_PASSWORD } = process.env;
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_ID,
      pass: EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_ID,
    to: email_to,
    subject: email_subject,
    text: email_content,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Error occurred:', error);
  }
}
